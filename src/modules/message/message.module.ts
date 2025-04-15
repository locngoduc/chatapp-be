import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupEntity } from '../group/entities/group.entity';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schemas/message.schemas';

@Module({
  imports: [
    MikroOrmModule.forFeature([GroupEntity, UserGroupEntity]),
    MongooseModule.forFeature(
      [{ name: Message.name, schema: MessageSchema }],
      'default',
    ),
  ],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
