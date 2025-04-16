import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQMessageDto } from '../message/dtos/rabbitmq-message-receive.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatConsumer implements OnModuleDestroy {
  private readonly instanceName: string;
  private readonly logger = new Logger(ChatConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.instanceName = this.configService.get('INSTANCE_NAME');
  }

  @RabbitSubscribe({
    exchange: 'chat_exchange',
    routingKey: process.env.INSTANCE_NAME,
    queue: process.env.INSTANCE_NAME,
    queueOptions: {
      autoDelete: true,
    },
  })
  handleReceiveMessage(msg: RabbitMQMessageDto) {
    this.logger.log(
      `[${this.instanceName}] received message: ${JSON.stringify(msg)}`,
    );
    const eventName = `chat.message.${msg.messageType}`;
    this.eventEmitter.emit(eventName, msg);
  }

  async onModuleDestroy() {
    await this.amqpConnection.channel.deleteQueue(this.instanceName);
    console.log(`Queue ${this.instanceName} deleted`);
  }
}
