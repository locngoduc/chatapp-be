import { ServiceError } from '../../../shared/errors/service.error';

export class GroupError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'GroupError';
  }
}
