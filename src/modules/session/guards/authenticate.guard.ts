import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest<Request>();
    // return request.isAuthenticated();
    if (request.isAuthenticated()) {
      return true;
    }
    throw new UnauthorizedException('User not authenticated');
  }
}
