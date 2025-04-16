import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateAccountRequestDto } from './dtos/create-account-request.dto';
import { Response } from 'express';
import { GroupEntity } from '../group/entities/group.entity';
@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Body() createAccountDto: CreateAccountRequestDto,
    @Res() res: Response,
  ) {
    const result = await this.usersService.createUser(createAccountDto);

    if (result.isOk()) return res.status(HttpStatus.CREATED).json(result.value);
    else return result.error.createResponse(res);
  }

  @Get(':userId/groups')
  async getGroupsByUserId(
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    const result = await this.usersService.getGroupsByUserId(userId);

    if (result.isOk()) return res.status(HttpStatus.OK).json(result.value);
    else return result.error.createResponse(res);
  }
}
