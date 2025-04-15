import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async sendToInstance(instanceQueue: string, payload: any) {
    // routingKey is also the instance name (because we use the same for routingKey, queue name and instance name)
    await this.amqpConnection.publish('chat_exchange', instanceQueue, payload);
  }
}
