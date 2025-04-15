import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RequestHandler } from 'express';
import { Server, ServerOptions } from 'socket.io';

export class SocketIOAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplicationContext,
    private readonly configService: ConfigService,
    private readonly sessionMiddleware: any,
    private readonly passportInitialize: any,
    private readonly passportSession: any,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, options);
    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.sessionMiddleware));
    server.use(wrap(this.passportInitialize));
    server.use(wrap(this.passportSession));
    server.use((socket, next) => {
      if ((socket.request as any).user) {
        next();
      } else {
        next(new Error('unauthorized'));
      }
    });
    return server;
  }
}
