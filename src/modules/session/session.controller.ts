import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.sevice';
import { LocalAuthGuard } from 'src/modules/session/guards/local-auth.guard';
import { AuthenticateGuard } from './guards/authenticate.guard';
import { AuthUser } from 'src/shared/decorators/auth-user.decorator';
import { SuccessResponse } from 'src/shared/classes/sussess.response.class';
// import { ok } from 'neverthrow';

@Controller({
  version: '1',
  path: 'session',
})
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@AuthUser() user) {
    const userValue = user?.value || user;
    const { hashedPassword, ...rest } = userValue;
    return new SuccessResponse('User successfully logged in', rest);
    // if (res.isOk()) return res.status(HttpStatus.OK).json(rest);
    // else return res.error.createResponse(res);
  }

  @UseGuards(AuthenticateGuard)
  @Get()
  async getSession(@AuthUser() user) {
    const { hashedPassword, ...rest } = user;
    // return res.status(HttpStatus.OK).json(rest);
    return new SuccessResponse('Session info queried successfully', rest);
  }

  @UseGuards(AuthenticateGuard)
  @Delete()
  async logout(@Req() req, @Res() res) {
    req.logout((err) => {
      if (err) {
        throw new InternalServerErrorException(err);
        // return err();
      }

      req.session.destroy((err) => {
        if (err) {
          throw new InternalServerErrorException(err);
        }

        res.clearCookie('chat-session');

        return res.json(new SuccessResponse('Successfully logged out', null));
      });
    });
  }
}
