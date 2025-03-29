import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schemas';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';

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

  async getAllMessages(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }
}
