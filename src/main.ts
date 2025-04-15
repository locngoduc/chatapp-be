import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import * as session from 'express-session';
import Redis from 'ioredis';
import { Logger } from 'nestjs-pino';
import * as passport from 'passport';
import { AppModule } from './app.module';
import { EnvConfig } from './config/env.config';
import { SocketIOAdapter } from './shared/socket/socket-io.apdater';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useWebSocketAdapter(new IoAdapter(app));

  const configService = app.get<ConfigService<EnvConfig>>(ConfigService);

  const redisClient = new Redis({
    host: configService.getOrThrow<string>('REDIS_HOST'),
    port: configService.getOrThrow<number>('REDIS_PORT'),
    password: configService.get<string>('REDIS_PASSWORD'),
  });

  // await redisClient.connect();

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'chat-session:',
  });

  const sessionMiddleware = session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: configService.getOrThrow<string>('SESSION_SECRET'),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 31,
    },
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  app.useWebSocketAdapter(
    new SocketIOAdapter(
      app,
      configService,
      sessionMiddleware,
      passport.initialize(),
      passport.session(),
    ),
  );

  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
