import { GroupError } from './base-group.error';
import { HttpStatus } from '@nestjs/common';

export class LogoUploadError extends GroupError {
  constructor(message: string) {
    super(`${message}`);
    this.name = 'LogoUploadError';
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}
