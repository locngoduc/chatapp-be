import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import {
  CursorPaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/wrapper';
import { DatabaseError } from 'src/shared/errors/database.error';
import { EntityNotFoundError } from 'src/shared/errors/entity-not-found.error';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
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
  ) {}

  async createMessage(
    messageData: CreateMessageRequestDto,
  ): Promise<Result<Message, DatabaseError>> {
    //Take authorId from socket or auth context

    //Handle error for groupId
    //Handle error for authorId

    const authorId = '6779d50d-4baf-41cc-814d-c35942225d6c'; // Placeholder for authorId
    try {
      const message = await this.messageModel.create({
        authorId,
        ...messageData,
      });
      return ok(message);
    } catch (error) {
      return err(new DatabaseError('Error creating message'));
    }
  }

  async getMessagesByGroupId(
    groupId: string,
    cursor?: string,
    limit: number = 1,
  ): Promise<Result<CursorPaginationWrapper<Message>, DatabaseError>> {
    const numericLimit = Number(limit);

    const query: QueryType = { groupId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    //Handle error for groupId
    //Check authentication and authorization
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
  ): Promise<Result<SuccessResponse<null>, DatabaseError>> {
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
