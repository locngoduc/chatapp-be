import { PassportSerializer } from '@nestjs/passport';
import { UserEntity } from '../user/entities/user.entity';
import { UsersService } from '../user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UsersService) {
    super();
  }

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
    console.log('[deserializeUser]', user);
    const userDB = await this.userService.findUserById(user.id);
    return userDB.isOk() ? done(null, userDB.value) : done(null, null);
  }
}
