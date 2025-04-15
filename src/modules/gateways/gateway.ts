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
import { Logger } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

@WebSocketGateway({ cors: true })
export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MyGateway.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly dictionaryService: DictionaryService,
  ) {}

  private readonly instanceName = this.configService.get('INSTANCE_NAME');

  async handleConnection(socket: Socket) {
    const user = (socket.request as any).user;
    if (user?.id) {
      await this.redisService.addUserInstance(user.id, this.instanceName);
      this.logger.log(`User ${user.email} connected on ${this.instanceName}`);
      this.dictionaryService.addUserSocket(user.id, socket.id);
      const userSockets = this.dictionaryService.getUserSockets(user.id);
      this.logger.log(
        `User ${user.email} has sockets: ${JSON.stringify(userSockets)}`,
      );
    }
  }

  async handleDisconnect(socket: Socket) {
    const user = (socket.request as any).user;
    if (user) {
      await this.redisService.removeUserInstance(user.id, this.instanceName);
      console.log(`User ${user.email} disconnected from ${this.instanceName}`);
      this.dictionaryService.removeUserSocket(user.id, socket.id);
      const userSockets = this.dictionaryService.getUserSockets(user.id);
      this.logger.log(
        `User ${user.email} has sockets: ${JSON.stringify(userSockets)}`,
      );
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
