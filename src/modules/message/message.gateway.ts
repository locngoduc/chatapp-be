import { forwardRef, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { err } from 'neverthrow';
import { Server } from 'socket.io';
import { DictionaryService } from '../gateways/dictionary.service';
import { GroupService } from '../group/group.service';
import { RedisService } from '../redis/redis.service';
import { RabbitMQMessageDto } from './dtos/rabbitmq-message-receive.dto';
import { MessageService } from './message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly dictionaryService: DictionaryService,
  ) {}

  private logger: Logger = new Logger(MessageGateway.name);

  @WebSocketServer() server: Server;

  @OnEvent('chat.message.create')
  handleCreateMessage(payload: RabbitMQMessageDto) {
    this.deliverToTargets(payload, 'message:created');
  }

  @OnEvent('chat.message.update')
  handleUploadMessage(payload: RabbitMQMessageDto) {
    this.deliverToTargets(payload, 'message:updated');
  }

  @OnEvent('chat.message.delete')
  handleDeleteMessage(payload: RabbitMQMessageDto) {
    this.deliverToDeleteMessageTargets(payload, 'message:deleted');
  }

  private async deliverToTargets(
    payload: RabbitMQMessageDto,
    eventName: string,
  ) {
    const connectedTargets = payload.targetIds;

    const result = await this.messageService.getMessageById(payload.messageId);

    if (result.isErr()) {
      this.logger.error('Failed to get message by ID to deliver');
      return err(result.error);
    }

    for (const userId of connectedTargets) {
      const socketIds = this.dictionaryService.getUserSockets(userId);

      for (const socketId of socketIds) {
        this.server.to(socketId).emit(eventName, result.value);
      }
    }
  }

  private async deliverToDeleteMessageTargets(
    payload: RabbitMQMessageDto,
    eventName: string,
  ) {
    const connectedTargets = payload.targetIds;

    for (const userId of connectedTargets) {
      const socketIds = this.dictionaryService.getUserSockets(userId);

      for (const socketId of socketIds) {
        this.server.to(socketId).emit(eventName, payload.messageId);
      }
    }
  }
}
