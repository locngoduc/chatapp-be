import { MikroOrmModule } from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupEntity } from '../group/entities/group.entity';
import { UserGroupEntity } from '../user_group/entities/user_group.entity';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './schemas/message.schemas';
import { MessageController } from './message.controller';
import { GroupModule } from '../group/group.module';
import { RedisModule } from '../redis/redis.module';
import { FilesModule } from '../files/files.module';
import { MessageQueueModule } from '../message-queue/message-queue.module';
import { GatewayModule } from '../gateways/gateway.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([GroupEntity, UserGroupEntity]),
    MongooseModule.forFeature(
      [{ name: Message.name, schema: MessageSchema }],
      'default',
    ),
    forwardRef(() => GroupModule),
    RedisModule,
    FilesModule,
    MessageQueueModule,
    GatewayModule,
  ],
  providers: [MessageService, MessageGateway],
  exports: [MessageService, MessageGateway],
  controllers: [MessageController],
})
export class MessageModule {}
