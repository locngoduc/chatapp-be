import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { CursorPaginationWrapper } from 'src/shared/classes/wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { GroupEntity } from '../group/entities/group.entity';
import { UnauthorizedError } from '../session/errors/unauthorized.error';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
import { Message, MessageDocument } from './schemas/message.schemas';
import { NotOwnerError } from './errors/not-owner.error';
import { NotMemberError } from './errors/not-member.error';
import { MessageError } from './errors/base-message.error';

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
  ) {}

  async createMessage(
    messageData: CreateMessageRequestDto,
    requesterId: string,
    files?: Express.Multer.File[],
  ): Promise<Result<Message, DatabaseError | EntityNotFoundError>> {
    //handle upload files

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
      return err(new EntityNotFoundError('UserGroup', requesterId));
    }
    try {
      const message = await this.messageModel.create({
        authorId: requesterId,
        ...messageData,
      });
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
  ): Promise<Result<null, DatabaseError | MessageError>> {
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

      return ok(null);
    } catch (error) {
      return err(new DatabaseError('Unexpected error'));
    }
  }

  async updateMessageById(
    messageId: string,
    messageData: UpdateMessageRequestDto,
    requesterId: string,
  ): Promise<Result<Message, EntityNotFoundError | DatabaseError>> {
    try {
      const updatedMessage = await this.messageModel.findById(messageId).exec();

      if (!updatedMessage) {
        return err(new EntityNotFoundError('Message', messageId));
      }

      if (updatedMessage.authorId !== requesterId) {
        return err(new NotOwnerError(requesterId, messageId));
      }

      wrap(updatedMessage).assign({
        ...messageData,
        updatedAt: new Date(),
      });

      await this.entityManager.persistAndFlush(updatedMessage);

      return ok(updatedMessage);
    } catch (error) {
      return err(new DatabaseError('Unexpected error'));
    }
  }
}
