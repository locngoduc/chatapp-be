import { GroupError } from './base-group.error';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyJoinError extends GroupError {
  constructor(userId: string, groupId: string) {
    super(`User with ID ${userId} already joined group with ID ${groupId}`);
    this.name = 'UserAlreadyJoinError';
    this.statusCode = HttpStatus.CONFLICT;
  }
}
