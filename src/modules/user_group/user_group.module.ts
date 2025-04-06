import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserGroupEntity } from './entities/user_group.entity';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../group/entities/group.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserGroupEntity])],
})
export class UserGroupModule {}
