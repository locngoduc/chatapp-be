import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ZodValidationPipe } from 'nestjs-zod';
import { Server, Socket } from 'socket.io';
import {
  CreateMessageRequestDto,
  CreateMessageRequestSchema,
} from './dtos/create-message-request.dto';
import { MessageService } from './message.service';
import { UpdateMessageRequestDto } from './dtos/update-message-request.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  private logger: Logger = new Logger(MessageGateway.name);

  @WebSocketServer() server: Server;

  async handleSendMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    //Waiting for websocket auth

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    //Sample for one instance
    this.server.to(data.groupId).emit('receiveMessage', data);

    return 'Hello world';
  }

  async handleUpdateMessage(
    @MessageBody(new ZodValidationPipe(UpdateMessageRequestDto))
    data: UpdateMessageRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    //Waiting for websocket auth
    //Using redis service to take all server instance in group
    //Handle push message to RabbitMQ
    //Sample for one instance
    return 'Hello world';
  }

  async handleDeleteMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    //Waiting for websocket auth
    //Using redis service to take all server instance in group
    //Handle push message to RabbitMQ
    //Sample for one instance
    this.server.to(data.groupId).emit('receiveDeleteMessage', data);
    return 'Hello world';
  }

  @SubscribeMessage('receiveMessage')
  handleReceiveMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
  ): string {
    //Handle error for invalid data like authorId and groupId

    //Handle send message to group - waiting for rabbitMQ and redis from tth

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('receiveEditMessage')
  handleReceiveUpdateMessage(
    @MessageBody(new ZodValidationPipe(UpdateMessageRequestDto))
    data: UpdateMessageRequestDto,
  ): string {
    //Handle error for invalid data like authorId and groupId

    //Handle send message to group - waiting for rabbitMQ and redis from tth

    //Using redis service to take all server instance in group

    //Handle push update message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('receiveDeleteMessage')
  handleReceiveDeleteMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
  ): string {
    //Handle error for invalid data like authorId and groupId

    //Handle send message to group - waiting for rabbitMQ and redis from tth

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('test')
  test(): string {
    this.logger.debug('Test message');
    return 'Test message';
  }
}
