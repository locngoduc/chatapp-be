//app.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/mikro-orm.config';
import { EnvConfig, envConfigParser } from './config/env.config';
import { UsersModule } from './modules/user/user.module';
import { FilesModule } from './modules/files/files.module';
import { FilesController } from './modules/files/files.controller';
import { LoggerModule } from 'nestjs-pino';
import { SessionModule } from './modules/session/session.module';
import { PassportModule } from '@nestjs/passport';
import { GatewayModule } from './modules/gateways/gateway.module';
import { RedisModule } from './modules/redis/redis.module';
import { LokiOptions } from 'pino-loki';
import { MessageQueueModule } from './modules/message-queue/message-queue.module';

import { MongooseModule } from '@nestjs/mongoose';
import mongooseConfig, { MONGO_URI } from './config/mongoose.config';
import { MessageModule } from './modules/message/message.module';
import { GroupModule } from './modules/group/group.module';
import { UserGroupModule } from './modules/user_group/user_group.module';
import { MessageController } from './modules/message/message.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envConfigParser }),
    MikroOrmModule.forRoot({
      ...ormConfig,
      entities: undefined,
      entitiesTs: undefined,
      autoLoadEntities: true,
    }),
    MongooseModule.forRoot(MONGO_URI, {
      ...mongooseConfig,
    }),
    EventEmitterModule.forRoot({ global: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvConfig>) => ({
        pinoHttp: {
          level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : {
                  target: 'pino-loki',
                  options: {
                    host: 'http://loki:3100',
                    batching: true,
                    interval: 5,
                    labels: {
                      job: 'api-server',
                      instance: configService.get('INSTANCE_NAME'),
                    },
                  } satisfies LokiOptions,
                },
        },
      }),
    }),
    UsersModule,
    FilesModule,
    SessionModule,
    PassportModule.register({ session: true }),
    MessageModule,
    GroupModule,
    UserGroupModule,
    GatewayModule,
    RedisModule,
    MessageQueueModule,
  ],
  controllers: [AppController, FilesController, MessageController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: 'APP_NAME',
      useFactory: (configService: ConfigService) => {
        return configService.get('INSTANCE_NAME');
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
