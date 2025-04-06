import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ZodValidationPipe } from 'nestjs-zod';
import { Server, Socket } from 'socket.io';
import { SuccessResponse } from 'src/shared/classes/wrapper';
import {
  CreateMessageRequestDto,
  CreateMessageRequestSchema,
} from './dtos/create-message-request.dto';
import { MessageService } from './message.service';
import { Message } from './schemas/message.schemas';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
  ) {
    //Handle error for invalid data like groupId

    //Handle save message to db
    const result = await this.messageService.createMessage(data);

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    //Sample for one instance
    this.server.to(data.groupId).emit('receiveMessage', data);

    if (result.isOk()) {
      return new SuccessResponse<Message>(
        'Message created successfully!',
        result.value,
      );
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

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
