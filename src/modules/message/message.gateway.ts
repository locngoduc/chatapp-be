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
import { MessageZodSchema } from './schemas/message.schemas';

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
  ): Promise<string> {
    //Handle error for invalid data like authorId and groupId

    //Handle save message to db
    const message = await this.messageService.createMessage(data);

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('receiveMessage')
  handleReceiveMessage(
    @MessageBody(new ZodValidationPipe(MessageZodSchema))
    data: CreateMessageRequestDto,
  ): string {
    //Handle error for invalid data like authorId and groupId

    //Handle send message to group
    this.server.emit(data.groupId, {
      authorId: data.authorId,
      groupId: data.groupId,
      content: data.content,
      attachments: data.attachments,
      createdAt: data.createdAt,
    });

    //Using redis service to take all server instance in group

    //Handle push message to RabbitMQ

    return 'Hello world';
  }

  @SubscribeMessage('test')
  handleTest(client: Socket, payload: any): string {
    client.emit('test: ', `Server received: ${payload}`);
    return 'Hello world!';
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
