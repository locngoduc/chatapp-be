import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class SessionService {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    console.log('Inside validate User');
    const userDB = await this.userService.findUserByEmail(email);
    if (userDB && (await argon2.verify(userDB.hashedPassword, password))) {
      return userDB;
    }
    return null;
  }
}
