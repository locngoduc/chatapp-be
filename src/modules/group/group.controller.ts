import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CursorPaginationWrapper } from 'src/shared/classes/wrapper';
import { MessageService } from '../message/message.service';
import { Message } from '../message/schemas/message.schemas';
import { UserEntity } from '../user/entities/user.entity';
import { AddUserRequestDto } from '../user_group/dto/add-user-request.dto';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupEntity } from './entities/group.entity';
import { GroupService } from './group.service';
import { ServiceError } from 'src/shared/errors/service.error';
@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createGroupDto: CreateGroupRequestDto,
    @Res() res: Response,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const result = await this.groupService.create(createGroupDto, logo);

    if (result.isOk()) {
      return res.status(HttpStatus.CREATED).json(result.value);
    } else {
      if (result.error instanceof ServiceError) {
        return result.error.createResponse(res);
      } else
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result.error);
    }
  }

  @Get(':groupId/messages')
  async getMessages(
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
    } else {
      return result.error.createResponse(res);
    }
  }

  @Delete(':groupId/users/:userId')
  async removeUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    // Sample for requesterId
    const result = await this.groupService.removeUser(
      userId,
      groupId,
      '123123',
    );

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(null);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Post(':groupId/users')
  async addUser(
    @Param('groupId') groupId: string,
    @Body('userId') addUserRequestDto: AddUserRequestDto,
    @Res() res: Response,
  ) {
    // Sample for requesterId
    const result = await this.groupService.addUser(
      groupId,
      addUserRequestDto,
      '123123',
    );

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Get(':groupId/users')
  async getUsers(@Param('groupId') groupId: string, @Res() res: Response) {
    const result = await this.groupService.getUsers(groupId);

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }
}
