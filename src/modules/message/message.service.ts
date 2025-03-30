import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schemas';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { err, ok, Result } from 'neverthrow';
import { PaginationWrapper } from 'src/shared/classes/cursor-pagination-wrapper';
import { MessageError } from './errors/base-message.error';
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
  ): Promise<Result<PaginationWrapper<Message[]>, MessageError>> {
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
        .limit(limit + 1)
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
        new PaginationWrapper<Message[]>(
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
}
