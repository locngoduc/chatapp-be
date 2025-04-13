import { ServiceError } from '../../../shared/errors/service.error';

export class SessionError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'SessionError';
  }
}
