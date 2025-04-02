import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { SessionService } from './session.sevice';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('SESSION_SERVICE') private readonly sessionService: SessionService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.sessionService.validateUser(email, password);
    if (!user) {
      // return err(new UnauthorizedError('Invalid credentials'));
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
