import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { MessageService } from '../message/message.service';
import { AuthenticateGuard } from '../session/guards/authenticate.guard';
import { UserEntity } from '../user/entities/user.entity';
import { AddUserRequestDto } from '../user_group/dto/add-user-request.dto';
import { CreateGroupRequestDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
@Controller({ path: 'groups', version: '1' })
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
  ) {}

  @Post()
  @UseGuards(AuthenticateGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async createGroup(
    @Body() createGroupDto: CreateGroupRequestDto,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const requesterId = requester.id;

    const result = await this.groupService.createGroup(
      createGroupDto,
      requesterId,
      logo,
    );

    if (result.isOk()) {
      return res.status(HttpStatus.CREATED).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Put(':groupId')
  @UseGuards(AuthenticateGuard)
  @UseInterceptors(FileInterceptor('logo'))
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() updateGroupRequestDto: CreateGroupRequestDto,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const requesterId = requester.id;
    const result = await this.groupService.updateGroup(
      groupId,
      updateGroupRequestDto,
      requesterId,
      logo,
    );
    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Delete(':groupId')
  @UseGuards(AuthenticateGuard)
  async deleteGroup(
    @Param('groupId') groupId: string,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ) {
    const requesterId = requester.id;

    const result = await this.groupService.deleteGroup(groupId, requesterId);

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(null);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Get(':groupId')
  async getGroupById(@Param('groupId') groupId: string, @Res() res: Response) {
    const result = await this.groupService.getGroupById(groupId);

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(result.value);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Get(':groupId/messages')
  @UseGuards(AuthenticateGuard)
  async getMessages(
    @Param('groupId') groupId: string,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
    @Query('limit') limit: number = 1,
    @Query('cursor') cursor?: string,
  ) {
    const result = await this.messageService.getMessagesByGroupId(
      requester.id,
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
  @UseGuards(AuthenticateGuard)
  async removeUser(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ) {
    const requesterId = requester.id;

    const result = await this.groupService.removeUser(
      userId,
      groupId,
      requesterId,
    );

    if (result.isOk()) {
      return res.status(HttpStatus.OK).json(null);
    } else {
      return result.error.createResponse(res);
    }
  }

  @Post(':groupId/users')
  @UseGuards(AuthenticateGuard)
  async addUser(
    @Param('groupId') groupId: string,
    @Body() addUserRequestDto: AddUserRequestDto,
    @Res() res: Response,
    @AuthUser() requester: UserEntity,
  ): Promise<Response<any, Record<string, any>>> {
    const requesterId = requester.id;

    const result = await this.groupService.addUser(
      groupId,
      addUserRequestDto,
      requesterId,
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
