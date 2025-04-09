import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as argon2 from 'argon2';
import { err, ok, Result } from 'neverthrow';
import { UserEntity } from '../user/entities/user.entity';
import { SessionError } from './errors/base-session.error';

@Injectable()
export class SessionService {
  constructor(private readonly userService: UsersService) {}

  private readonly logger = new Logger(SessionService.name);

  async validateUser(
    email: string,
    password: string,
  ): Promise<Result<UserEntity, SessionError>> {
    this.logger.log('Validating user', email);
    const userDB = await this.userService.findUserByEmail(email);
    if (
      userDB.isOk() &&
      (await argon2.verify(userDB.value.hashedPassword, password))
    ) {
      return ok(userDB.value);
    }
    return err(new SessionError('Invalid credentials'));
  }
}
