import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schemas';
import { MessageGateway } from './message.gateway';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Message.name, schema: MessageSchema }],
      'default',
    ),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
