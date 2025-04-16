import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { MessageModule } from '../message/message.module';
import { UserEntity } from '../user/entities/user.entity';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { GroupEntity } from './entities/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([GroupEntity, UserEntity, UserGroupEntity]),
    forwardRef(() => MessageModule),
    FilesModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
