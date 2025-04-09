import { Injectable } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class SessionService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(email: string, password: string) {
    console.log('Inside validate User');
    const userDB = await this.userService.findUserByEmail(email);
    console.log('User DB:', userDB);
    if (
      userDB.isOk() &&
      (await argon2.verify(userDB.value.hashedPassword, password))
    ) {
      return userDB.value;
    }
    return null;
  }
}
