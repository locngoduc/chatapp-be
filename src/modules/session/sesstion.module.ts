import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.sevice';
import { UsersService } from '../user/user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '../user/entities/user.entity';
import { LocalStrategy } from './session-local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [SessionController],
  providers: [
    {
      provide: 'SESSION_SERVICE',
      useClass: SessionService,
    },
    {
      provide: 'USER_SERVICE',
      useClass: UsersService,
    },
    LocalStrategy,
    SessionSerializer,
  ],
})
export class SessionModule {}
