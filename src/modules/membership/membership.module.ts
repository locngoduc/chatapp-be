import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipGateway } from './membership.gateway';

@Module({
  providers: [MembershipGateway, MembershipService],
})
export class MembershipModule {}
