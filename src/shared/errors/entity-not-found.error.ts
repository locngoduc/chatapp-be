import { HttpStatus } from '@nestjs/common';
import { ServiceError } from './service.error';

export class EntityNotFoundError extends ServiceError {
  constructor(entityName: string, entityId: string) {
    super(`Entity ${entityName} (ID: ${entityId}) not found`);

    this.name = 'EntityNotFoundError';
    this.statusCode = HttpStatus.NOT_FOUND;
  }
}
