import { ServiceError } from '../../../shared/errors/service.error';

export class UserError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}
