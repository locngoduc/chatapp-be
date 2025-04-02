import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipGateway } from './membership.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MembershipEntity } from './entities/membership.entity';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../group/entities/group.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([MembershipEntity, UserEntity, GroupEntity]),
  ],
  providers: [MembershipGateway, MembershipService],
})
export class MembershipModule {}
