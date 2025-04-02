import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipGateway } from './membership.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MembershipEntity } from './entities/membership.entity';

@Module({
  imports: [MikroOrmModule.forFeature([MembershipEntity])],
  providers: [MembershipGateway, MembershipService],
})
export class MembershipModule {}
