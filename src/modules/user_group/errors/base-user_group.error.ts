import { ServiceError } from '../../../shared/errors/service.error';

export class UserGroupError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'UserGroupError';
  }
}
