import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MessageService } from './message.service';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';

@Controller({ path: 'message', version: '1' })
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() messageData: CreateMessageRequestDto) {
    return this.messageService.createMessage(messageData);
  }

  @Get('group/:groupId')
  async getMessagesByGroupId(
    @Param('groupId') groupId: string,
    @Res() res: Response,
    @Query('limit') limit: number = 1,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.messageService.getMessagesByGroupId(
      groupId,
      cursor,
      limit,
    );

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else return result.error.createResponse(res);
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Res() res: Response,
  ) {
    const result = await this.messageService.deleteMessage(messageId);

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else return result.error.createResponse(res);
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() messageData: UpdateMessageRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.messageService.updateMessageById(
      messageId,
      messageData,
    );

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else return result.error.createResponse(res);
  }
}
