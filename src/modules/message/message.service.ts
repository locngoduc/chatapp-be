import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { CursorPaginationWrapper } from 'src/shared/classes/wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { FileUploadResult } from '../files/dtos/file-upload-result.dto';
import { CloudinaryService } from '../files/impl/cloudinary.service';
import { GroupEntity } from '../group/entities/group.entity';
import { GroupService } from '../group/group.service';
import { ChatPublisher } from '../message-queue/publisher';
import { RedisService } from '../redis/redis.service';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
import { MessageError } from './errors/base-message.error';
import { FilesUploadError } from './errors/files-upload.error';
import { NotMemberError } from './errors/not-member.error';
import { NotOwnerError } from './errors/not-owner.error';
import { Message, MessageDocument } from './schemas/message.schemas';

type QueryType = {
  groupId: string;
  createdAt?: { $lt: Date };
};

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message', 'default')
    private readonly messageModel: Model<MessageDocument>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: EntityRepository<GroupEntity>,
    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepository: EntityRepository<UserGroupEntity>,
    private readonly entityManager: EntityManager,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly groupService: GroupService,
    private readonly publisher: ChatPublisher,
  ) {}

  private logger: Logger = new Logger(MessageService.name);

  async createMessage(
    messageData: CreateMessageRequestDto,
    requesterId: string,
    files?: Express.Multer.File[],
  ): Promise<
    Result<
      Message,
      DatabaseError | EntityNotFoundError | FilesUploadError | MessageError
    >
  > {
    let uploadFiles: FileUploadResult[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.cloudinaryService.uploadFile(file),
      );
      const uploadResults = await Promise.all(uploadPromises);
      const failedUploads = uploadResults.filter((result) => result.isErr());
      if (failedUploads.length > 0) {
        return err(new FilesUploadError('Error uploading files'));
      }
      uploadFiles = uploadResults.map((result) =>
        result.isOk() ? result.value : null,
      );
    }

    console.log('Uploaded files:', uploadFiles);

    const { groupId } = messageData;

    const group = await this.groupRepository.findOne({
      id: groupId,
    });
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    const userGroup = await this.userGroupRepository.findOne({
      user: { id: requesterId },
      group: { id: group.id },
    });

    if (!userGroup) {
      return err(new NotMemberError(requesterId, groupId));
    }

    try {
      const message = await this.messageModel.create({
        authorId: requesterId,
        ...messageData,
        attachments: uploadFiles,
      });

      // start: Publish to RabbitMQ here

      const result = await this.groupService.getAllUserIdByGroupId(groupId);

      if (result.isErr()) {
        this.logger.error(`Error getting user IDs for group ${groupId}`);
        return err(result.error);
      }

      const instanceMap = await this.groupUserIdsByInstance(result.value);

      for (const [instanceId, userIds] of Object.entries(instanceMap)) {
        await this.publisher.sendToInstance(instanceId, {
          messageId: message.id,
          targetIds: userIds,
          messageType: 'create',
        });
      }

      // end: Publish to RabbitMQ here

      return ok(message);
    } catch (error) {
      return err(new DatabaseError('Error creating message'));
    }
  }

  async getMessagesByGroupId(
    requesterId: string,
    groupId: string,
    cursor?: string,
    limit: number = 1,
  ): Promise<
    Result<CursorPaginationWrapper<Message>, DatabaseError | MessageError>
  > {
    const group = await this.groupRepository.findOne({
      id: groupId,
    });
    if (!group) {
      return err(new EntityNotFoundError('Group', groupId));
    }

    const userGroup = await this.userGroupRepository.findOne({
      user: { id: requesterId },
      group: { id: group.id },
    });

    if (!userGroup) {
      return err(new NotMemberError(requesterId, groupId));
    }

    const numericLimit = Number(limit);

    const query: QueryType = { groupId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    try {
      const messages = await this.messageModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(numericLimit + 1)
        .exec();

      const hasMore = messages.length > limit;
      if (hasMore) {
        messages.pop();
      }

      const nextCursor =
        messages.length > 0
          ? messages[messages.length - 1].createdAt.toISOString()
          : undefined;

      return ok(
        new CursorPaginationWrapper<Message>(nextCursor, hasMore, messages),
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      return err(new DatabaseError('Unexpected error'));
    }
  }

  async deleteMessage(
    messageId: string,
    requesterId: string,
  ): Promise<Result<null, DatabaseError | MessageError | EntityNotFoundError>> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      return err(new EntityNotFoundError('Message', messageId));
    }

    if (message.authorId !== requesterId) {
      return err(new NotOwnerError(requesterId, messageId));
    }

    try {
      const deletedMessage = await this.messageModel
        .findByIdAndDelete(messageId)
        .exec();

      if (!deletedMessage) {
        return err(new EntityNotFoundError('Message', messageId));
      }

      // start: Publish to RabbitMQ here
      const result = await this.groupService.getAllUserIdByGroupId(
        message.groupId,
      );

      if (result.isErr()) {
        this.logger.error(
          `Error getting user IDs for group ${message.groupId}`,
        );
        return err(result.error);
      }

      const instanceMap = await this.groupUserIdsByInstance(result.value);

      for (const [instanceId, userIds] of Object.entries(instanceMap)) {
        await this.publisher.sendToInstance(instanceId, {
          messageId: messageId,
          targetIds: userIds,
          messageType: 'delete',
        });
      }
      // end: Publish to RabbitMQ here

      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Unexpected error'));
    }
  }

  async updateMessageById(
    messageId: string,
    messageData: UpdateMessageRequestDto,
    requesterId: string,
  ): Promise<
    Result<Message, EntityNotFoundError | DatabaseError | MessageError>
  > {
    try {
      const updatedMessage = await this.messageModel.findById(messageId).exec();

      if (!updatedMessage) {
        return err(new EntityNotFoundError('Message', messageId));
      }

      if (updatedMessage.authorId !== requesterId) {
        return err(new NotOwnerError(requesterId, messageId));
      }

      updatedMessage.content = messageData.content;
      updatedMessage.updatedAt = new Date();

      await updatedMessage.save();

      // start: Publish to RabbitMQ here
      const result = await this.groupService.getAllUserIdByGroupId(
        updatedMessage.groupId,
      );

      if (result.isErr()) {
        this.logger.error(
          `Error getting user IDs for group ${updatedMessage.groupId}`,
        );
        return err(result.error);
      }

      const instanceMap = await this.groupUserIdsByInstance(result.value);

      for (const [instanceId, userIds] of Object.entries(instanceMap)) {
        await this.publisher.sendToInstance(instanceId, {
          messageId: messageId,
          targetIds: userIds,
          messageType: 'update',
        });
      }
      // end: Publish to RabbitMQ here
      return ok(updatedMessage);
    } catch (error) {
      this.logger.error(`Error updating message: ${error.message}`);
      return err(new DatabaseError('Unexpected error'));
    }
  }

  async groupUserIdsByInstance(
    userIds: string[],
  ): Promise<Record<string, string[]>> {
    const instanceMap: Record<string, Set<string>> = {};

    const instancePairs = await Promise.all(
      userIds.map(async (userId) => {
        const instanceIds = await this.redisService.getUserInstances(userId);
        return { userId, instanceIds };
      }),
    );

    for (const { userId, instanceIds } of instancePairs) {
      for (const instanceId of instanceIds) {
        if (!instanceMap[instanceId]) {
          instanceMap[instanceId] = new Set();
        }
        instanceMap[instanceId].add(userId);
      }
    }

    const result: Record<string, string[]> = {};
    for (const [instanceId, userSet] of Object.entries(instanceMap)) {
      result[instanceId] = Array.from(userSet);
    }

    return result;
  }

  async getMessageById(
    messageId: string,
  ): Promise<Result<Message, EntityNotFoundError | DatabaseError>> {
    try {
      const message = await this.messageModel.findById(messageId).exec();

      if (!message) {
        return err(new EntityNotFoundError('Message', messageId));
      }

      return ok(message);
    } catch (error) {
      return err(new DatabaseError('Unexpected error'));
    }
  }
}
