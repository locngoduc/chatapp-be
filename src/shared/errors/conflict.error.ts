import { ServiceError } from '../errors/service.error';

export class ConflictError extends ServiceError {
  constructor(entityName: string, entityId: string) {
    super(`Entity ${entityName} with ID: ${entityId} already exists`);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}
