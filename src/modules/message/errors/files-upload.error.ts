import { MessageError } from './base-message.error';
import { HttpStatus } from '@nestjs/common';

export class FilesUploadError extends MessageError {
  constructor(message: string) {
    super(`${message}`);
    this.name = 'FilesUploadError';
    this.statusCode = HttpStatus.BAD_REQUEST;
  }
}
