import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: true })
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  private readonly instanceName = this.configService.get('INSTANCE_NAME');

  async handleConnection(client: Socket) {
    const user = (client.request as any).user;
    if (user?.id) {
      this.redisService.addUserInstance(user.id, this.instanceName);
      console.log(`User ${user.email} connected on ${this.instanceName}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = (client.request as any).user;
    if (user) {
      await this.redisService.removeUserInstance(user.id, this.instanceName);
      console.log(`User ${user.email} disconnected from ${this.instanceName}`);
    }
  }

  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log('Client connected:', (socket.request as any).user);
  //   });
  // }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log('Received message:', body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }
}
