import { Body, Controller, Get, Post } from '@nestjs/common';
import { Message } from './schemas/message.schemas';
import { MessageService } from './message.service';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';

@Controller({ path: 'message', version: '1' })
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() messageData: CreateMessageRequestDto) {
    return this.messageService.createMessage(messageData);
  }

  @Get()
  async getAllMessages() {
    return this.messageService.getAllMessages();
  }
}
