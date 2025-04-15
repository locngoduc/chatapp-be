import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthenticateGuard } from '../session/guards/authenticate.guard';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MessageGateway } from './message.gateway';

@Controller({ path: 'messages', version: '1' })
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageGateway: MessageGateway,
  ) {}

  @Post()
  @UseGuards(AuthenticateGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async createMessage(
    @Body() createMessageDto: CreateMessageRequestDto,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const result = await this.messageService.createMessage(
      createMessageDto,
      requester.id,
      files,
    );

    //Handle websocket here
    //this.messageGateway.handleSendMessage(createMessageDto, files);

    if (result.isOk()) {
      return res.status(HttpStatus.CREATED).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Post(':messageId')
  @UseGuards(AuthenticateGuard)
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: CreateMessageRequestDto,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ) {
    const result = await this.messageService.updateMessageById(
      messageId,
      updateMessageDto,
      requester.id,
    );

    //Handle websocket here
    //this.messageGateway.handleUpdateMessage(updateMessageDto, files);

    if (result.isOk()) {
      return res.status(HttpStatus.CREATED).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Delete(':messageId')
  @UseGuards(AuthenticateGuard)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ) {
    const result = await this.messageService.deleteMessage(
      messageId,
      requester.id,
    );

    //Handle websocket here
    //this.messageGateway.handleDeleteMessage(messageId, requester.id);

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    }
    return result.error.createResponse(res);
  }
}
