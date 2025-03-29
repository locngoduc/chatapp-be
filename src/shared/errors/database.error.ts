import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class DatabaseError extends Error {
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

  constructor(message: string) {
    super(message);
    this.name = 'BaseError';
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      errorMessage: this.message,
    };
  }

  createResponse(res: Response) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}
