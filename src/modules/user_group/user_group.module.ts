import { Module } from '@nestjs/common';
import { UserGroupService } from './user_group.service';
import { UserGroupGateway } from './user_group.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserGroupEntity } from './entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../group/entities/group.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserGroupEntity, UserEntity, GroupEntity]),
  ],
  providers: [UserGroupGateway, UserGroupService],
})
export class UserGroupModule {}
