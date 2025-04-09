import { PassportSerializer } from '@nestjs/passport';
import { UserEntity } from '../user/entities/user.entity';
import { UsersService } from '../user/user.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UsersService) {
    super();
  }

  private readonly logger = new Logger(SessionSerializer.name);

  serializeUser(
    user: UserEntity,
    done: (err: Error | null, user: UserEntity) => void,
  ) {
    done(null, user);
  }

  async deserializeUser(
    user: UserEntity,
    done: (err: Error | null, user: UserEntity) => void,
  ) {
    this.logger.log('DeserializeUser', user);

    const userDB = await this.userService.findUserById(user.id);
    return userDB.isOk() ? done(null, userDB.value) : done(userDB.error, null);
  }
}
