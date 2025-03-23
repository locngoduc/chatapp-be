import { HttpStatus } from '@nestjs/common';

export class BaseError extends Error {
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(message: string) {
    super(message);
    this.name = 'BaseError';
  }

  toJSON() {
    return {
      status: this.statusCode,
      error: this.message,
    };
  }
}
