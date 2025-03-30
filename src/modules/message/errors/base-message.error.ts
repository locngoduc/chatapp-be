import { ServiceError } from '../../../shared/errors/service.error';

export class MessageError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'MessageError';
  }
}
