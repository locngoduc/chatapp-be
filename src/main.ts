import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { Logger } from 'nestjs-pino';
import * as session from 'express-session';
import * as passport from 'passport';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';
import { IoAdapter } from '@nestjs/platform-socket.io';

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

  app.use(
    session({
      name: 'chat-session',
      store: redisStore,
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
