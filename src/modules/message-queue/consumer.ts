import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatConsumer implements OnModuleDestroy {
  private readonly instanceName: string;
  private readonly logger = new Logger(ChatConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly amqpConnection: AmqpConnection,
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
  handleReceiveMessage(msg: any) {
    this.logger.log(
      `[${this.instanceName}] received message: ${JSON.stringify(msg)}`,
    );
  }

  async onModuleDestroy() {
    await this.amqpConnection.channel.deleteQueue(this.instanceName);
    console.log(`Queue ${this.instanceName} deleted`);
  }
}
