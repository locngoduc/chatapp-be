import { HttpStatus } from '@nestjs/common';
import { UserError } from 'src/modules/user/errors/base-user.error';

export class UnauthorizedError extends UserError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = HttpStatus.UNAUTHORIZED;
  }
}
