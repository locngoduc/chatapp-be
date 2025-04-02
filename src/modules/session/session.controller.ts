import { Controller, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.sevice';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  version: '1',
  path: 'session',
})
export class SessionController {
  constructor(
    @Inject('SESSION_SERVICE') private readonly sessionService: SessionService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {}

  //   @UseGuards(AuthGuard('local'))
  //   @Post('login')
  //   async login(@Request() req) {
  //     return req.user;
  //   }

  //   @Get()
  //   async getUser() {
  //     const user = await this.sessionService.validateUser('e@gmail.com', '1');
  //     return user;
  //   }
}
