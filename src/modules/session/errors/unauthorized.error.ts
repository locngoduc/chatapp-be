import { HttpStatus } from '@nestjs/common';
import { SessionError } from './base-session.error';

export class UnauthorizedError extends SessionError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = HttpStatus.UNAUTHORIZED;
  }
}
