import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateAccountRequestDto } from './dtos/create-account-request.dto';
import { Response } from 'express';
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
}
