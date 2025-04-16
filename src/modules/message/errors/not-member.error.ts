import { MessageError } from './base-message.error';
import { HttpStatus } from '@nestjs/common';

export class NotMemberError extends MessageError {
  constructor(userId: string, groupId: string) {
    super(
      `User with ID ${userId} is not the member of group with ID ${groupId}`,
    );
    this.name = 'NotMemberError';
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}
