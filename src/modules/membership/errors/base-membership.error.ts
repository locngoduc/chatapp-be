import { ServiceError } from '../../../shared/errors/service.error';

export class MembershipError extends ServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'MembershipError';
  }
}
