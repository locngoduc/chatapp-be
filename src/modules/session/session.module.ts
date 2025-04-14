import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.sevice';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '../user/entities/user.entity';
import { LocalStrategy } from './session-local.strategy';
import { SessionSerializer } from './session.serializer';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity]), UsersModule],
  controllers: [SessionController],
  providers: [SessionService, LocalStrategy, SessionSerializer],
})
export class SessionModule {}
