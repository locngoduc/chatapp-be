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
import {
  CreateMessageRequestDto,
  CreateMessageRequestSchema,
} from './dtos/create-message-request.dto';
import { MessageService } from './message.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly messageService: MessageService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody(new ZodValidationPipe(CreateMessageRequestSchema))
    data: CreateMessageRequestDto,
  ): string {
    //Handle error for invalid data like authorId and groupId

    //Handle save message to db
    this.messageService.createMessage(data);

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('test')
  handleTest(client: Socket, payload: any): string {
    client.emit('test: ', `Server received: ${payload}`);
    return 'Hello world';
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
