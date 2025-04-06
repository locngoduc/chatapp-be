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
} from '@nestjs/common';
import { Response } from 'express';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import {
  CursorPaginationWrapper,
  SuccessResponse,
} from 'src/shared/classes/wrapper';
import { GroupEntity } from './entities/group.entity';
import { get } from 'http';
import { MessageService } from '../message/message.service';
import { Message } from '../message/schemas/message.schemas';
import { AddUserRequestDto } from '../user_group/dto/add-user-request.dto';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
  ) {}

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.groupService.create(createGroupDto);

    if (result.isOk()) {
      return res
        .status(HttpStatus.CREATED)
        .json(
          new SuccessResponse<GroupEntity>(
            'Group created successfully!',
            result.value,
          ),
        );
    } else {
      return result.error.createResponse(res);
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
      return res
        .status(HttpStatus.OK)
        .json(
          new SuccessResponse<CursorPaginationWrapper<Message>>(
            'Group messages retrieved successfully!',
            result.value,
          ),
        );
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
    const result = await this.groupService.removeUser(userId, groupId);

    if (result.isOk()) {
      return res
        .status(HttpStatus.OK)
        .json(
          new SuccessResponse<null>(
            'User removed from group successfully!',
            null,
          ),
        );
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
    const result = await this.groupService.addUser(groupId, addUserRequestDto);

    if (result.isOk()) {
      return res
        .status(HttpStatus.OK)
        .json(
          new SuccessResponse<UserGroupEntity>(
            'User added to group successfully!',
            result.value,
          ),
        );
    } else {
      return result.error.createResponse(res);
    }
  }

  @Get(':groupId/users')
  async getUsers(@Param('groupId') groupId: string, @Res() res: Response) {
    const result = await this.groupService.getUsers(groupId);

    if (result.isOk()) {
      return res
        .status(HttpStatus.OK)
        .json(
          new SuccessResponse<UserEntity[]>(
            'Group users retrieved successfully!',
            result.value,
          ),
        );
    } else {
      return result.error.createResponse(res);
    }
  }
}
