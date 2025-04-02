import {
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.sevice';
import { Request } from 'express';
import { LocalAuthGuard } from 'src/modules/session/guards/local-auth.guard';
import { AuthenticateGuard } from './guards/authenticate.guard';

@Controller({
  version: '1',
  path: 'session',
})
export class SessionController {
  constructor(
    @Inject('SESSION_SERVICE') private readonly sessionService: SessionService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login() {}

  @Get()
  async getSession(@Session() session: Record<string, any>) {
    console.log('session', session);
    console.log(session.id);
    return session;
  }

  @UseGuards(AuthenticateGuard)
  @Get('status')
  async getSessionStatus(@Req() req: Request) {
    return req.user;
  }
}
