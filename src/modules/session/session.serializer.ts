import { Inject } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserEntity } from '../user/entities/user.entity';
import { UsersService } from '../user/user.service';

export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UsersService,
  ) {
    super();
  }

  serializeUser(
    user: UserEntity,
    done: (err: Error | null, user: UserEntity) => void,
  ) {
    console.log('serializeUser', user);
    done(null, user);
  }

  async deserializeUser(
    user: UserEntity,
    done: (err: Error | null, user: UserEntity) => void,
  ) {
    console.log('deserializeUser', user);
    const userDB = await this.userService.findUserById(user.id);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
