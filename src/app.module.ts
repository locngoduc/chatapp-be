//app.module.ts
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/mikro-orm.config';
import { envConfigParser } from './config/env.config';
import { UsersModule } from './modules/user/user.module';
import { FilesModule } from './modules/files/files.module';
import { FilesController } from './modules/files/files.controller';

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
    UsersModule,
    FilesModule,
  ],
  controllers: [AppController, FilesController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
