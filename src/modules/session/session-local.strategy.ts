import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { SessionService } from './session.sevice';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly sessionService: SessionService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const validateResult = await this.sessionService.validateUser(
      email,
      password,
    );

    if (validateResult.isOk()) {
      return validateResult.value;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
