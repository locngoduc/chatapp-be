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
import { FilesModule } from './modules/files/files.module';
import { FilesController } from './modules/files/files.controller';
import { LoggerModule } from 'nestjs-pino';
import { SessionModule } from './modules/session/session.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: envConfigParser }),
    MikroOrmModule.forRoot({
      ...ormConfig,
      entities: undefined,
      entitiesTs: undefined,
      autoLoadEntities: true,
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
    FilesModule,
    SessionModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AppController, FilesController],
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
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly configService: ConfigService<EnvConfig>) {}

  onModuleInit() {
    this.logger.log(
      `Instance: ${this.configService.get('INSTANCE_NAME')} started on port ${this.configService.get('APP_PORT')}`,
    );
  }
}
