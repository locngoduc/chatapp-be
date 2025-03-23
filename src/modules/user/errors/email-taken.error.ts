import { UserError } from './base-user.error';
import { HttpStatus } from '@nestjs/common';

export class EmailTakenError extends UserError {
  constructor(email: string) {
    super(`The email '${email}' is already in use`);
    this.name = 'EmailTakenError';
    this.statusCode = HttpStatus.CONFLICT;
  }
}
