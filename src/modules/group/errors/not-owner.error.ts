import { GroupError } from './base-group.error';
import { HttpStatus } from '@nestjs/common';

export class NotOwnerError extends GroupError {
  constructor(userId: string, groupId: string) {
    super(
      `User with ID ${userId} is not the owner of group with ID ${groupId}`,
    );
    this.name = 'NotOwnerError';
    this.statusCode = HttpStatus.FORBIDDEN;
  }
}
