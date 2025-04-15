import { MessageError } from './base-message.error';
import { HttpStatus } from '@nestjs/common';

export class NotOwnerError extends MessageError {
  constructor(userId: string, messageId: string) {
    super(
      `User with ID ${userId} is not the owner of message with ID ${messageId}`,
    );
    this.name = 'NotOwnerError';
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}
