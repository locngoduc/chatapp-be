import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schemas';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { err, ok, Result } from 'neverthrow';
import {
  CursorPaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/wrapper';
import { MessageError } from './errors/base-message.error';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message', 'default')
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(messageData: CreateMessageRequestDto): Promise<Message> {
    const message = new this.messageModel(messageData);
    return message.save();
  }

  async getMessagesByGroupId(
    groupId: string,
    cursor?: string,
    limit: number = 1,
  ): Promise<Result<CursorPaginationWrapper<Message[]>, MessageError>> {
    const numericLimit = Number(limit);

    try {
      const query: any = { groupId };

      if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
      }

      //Handle error for groupId
      //Check authentication and authorization

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
        new CursorPaginationWrapper<Message[]>(
          'success',
          messages,
          nextCursor,
          hasMore,
        ),
      );
    } catch (error) {
      console.error(error);
      return err(new MessageError('Unexpected error'));
    }
  }

  async deleteMessage(
    messageId: string,
  ): Promise<Result<SuccessResponse<string>, MessageError>> {
    try {
      const deletedMessage = await this.messageModel
        .findByIdAndDelete(messageId)
        .exec();

      if (!deletedMessage) {
        return err(new MessageError('Message not found'));
      }

      return ok(new SuccessResponse('Message deleted successfully'));
    } catch (error) {
      console.error(error);
      return err(new MessageError('Unexpected error'));
    }
  }

  async updateMessageById(
    messageId: string,
    messageData: UpdateMessageRequestDto,
  ): Promise<Result<SuccessResponse<Message>, MessageError>> {
    try {
      const updatedMessage = await this.messageModel
        .findByIdAndUpdate(
          messageId,
          { $set: { content: messageData.content } },
          { new: true },
        )
        .exec();

      if (!updatedMessage) {
        return err(new MessageError('Message not found'));
      }

      return ok(
        new SuccessResponse<Message>(
          'Update message successfully',
          updatedMessage,
        ),
      );
    } catch (error) {
      console.error(error);
      return err(new MessageError('Unexpected error'));
    }
  }
}
