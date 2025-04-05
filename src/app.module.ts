//app.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/mikro-orm.config';
import { EnvConfig, envConfigParser } from './config/env.config';
import { UsersModule } from './modules/user/user.module';
import { LoggerModule } from 'nestjs-pino';

import { MongooseModule } from '@nestjs/mongoose';
import mongooseConfig, { MONGO_URI } from './config/mongoose.config';
import { MessageModule } from './modules/message/message.module';
import { GroupModule } from './modules/group/group.module';
import { UserGroupModule } from './modules/user_group/user_group.module';

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
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    UsersModule,
    MessageModule,
    GroupModule,
    UserGroupModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly configService: ConfigService<EnvConfig>) {}

  onModuleInit() {
    this.logger.log(
      `Instance: ${this.configService.get('INSTANCE_NAME')} started on port ${this.configService.get('APP_PORT')}`,
    );
  }
}
