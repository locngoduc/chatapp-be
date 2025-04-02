import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.sevice';
import { UsersService } from '../user/user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '../user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './session-local.strategy';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity]), PassportModule],
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
  ],
})
export class SessionModule {}
