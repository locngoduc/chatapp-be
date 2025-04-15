import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { CursorPaginationWrapper } from 'src/shared/classes/wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
import { Message, MessageDocument } from './schemas/message.schemas';
import { InjectRepository } from '@mikro-orm/nestjs';
import { GroupEntity } from '../group/entities/group.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UnauthorizedError } from '../session/errors/unauthorized.error';

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
  ) {}

  async createMessage(
    messageData: CreateMessageRequestDto,
    requesterId: string,
  ): Promise<Result<Message, DatabaseError | EntityNotFoundError>> {
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
  ): Promise<Result<CursorPaginationWrapper<Message>, DatabaseError>> {
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
  ): Promise<Result<null, DatabaseError>> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      return err(new EntityNotFoundError('Message', messageId));
    }

    if (message.authorId !== requesterId) {
      return err(
        new UnauthorizedError('User is not the author of the message'),
      );
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
  ): Promise<Result<Message, EntityNotFoundError | DatabaseError>> {
    try {
      const updatedMessage = await this.messageModel
        .findByIdAndUpdate(
          messageId,
          { $set: { content: messageData.content } },
          { new: true },
        )
        .exec();

      if (!updatedMessage) {
        return err(new EntityNotFoundError('Message', messageId));
      }

      return ok(updatedMessage);
    } catch (error) {
      return err(new DatabaseError('Unexpected error'));
    }
  }
}
