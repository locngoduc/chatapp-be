import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatPublisher } from './publisher';
import { ChatConsumer } from './consumer';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: 'chat_exchange',
            type: 'direct',
          },
        ],
        uri: `amqp://${configService.get('RABBITMQ_DEFAULT_USER')}:${configService.get('RABBITMQ_DEFAULT_PASS')}@rabbitmq:5672`,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ChatPublisher, ChatConsumer],
  exports: [ChatPublisher, ChatConsumer],
})
export class MessageQueueModule {}
