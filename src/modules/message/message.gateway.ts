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
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { GroupService } from '../group/group.service';
import { RedisService } from '../redis/redis.service';
import { err, ok } from 'neverthrow';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  constructor(
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly redisService: RedisService,
  ) {}

  private logger: Logger = new Logger(MessageGateway.name);

  @WebSocketServer() server: Server;

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
