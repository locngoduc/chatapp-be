import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { AuthenticateGuard } from '../session/guards/authenticate.guard';
import { UserEntity } from '../user/entities/user.entity';
import { CreateMessageRequestDto } from './dtos/create-message-request.dto';
import { MessageService } from './message.service';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';

@Controller({ path: 'messages', version: '1' })
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

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

    if (result.isOk()) {
      return res.status(HttpStatus.CREATED).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Patch(':messageId')
  @UseGuards(AuthenticateGuard)
  async updateMessage(
    @Body() updateMessageDto: UpdateMessageRequestDto,
    @Param('messageId') messageId: string,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ) {
    const result = await this.messageService.updateMessageById(
      messageId,
      updateMessageDto,
      requester.id,
    );

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

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    }
    return result.error.createResponse(res);
  }
}
