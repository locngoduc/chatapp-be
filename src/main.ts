import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { Logger } from 'nestjs-pino';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useWebSocketAdapter(new IoAdapter(app));

  const configService = app.get<ConfigService<EnvConfig>>(ConfigService);
  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
