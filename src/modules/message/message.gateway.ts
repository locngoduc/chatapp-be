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

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
    @ConnectedSocket() socket: Socket,
  ) {
    //Waiting for websocket auth

    // const user = client.user as UserEntity;
    const result = await this.messageService.createMessage(data, 'Sample Id');

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    //Sample for one instance
    this.server.to(data.groupId).emit('receiveMessage', data);

    if (result.isOk()) {
      return result.value;
    } else {
      return result.error.toJSON();
    }
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
}
