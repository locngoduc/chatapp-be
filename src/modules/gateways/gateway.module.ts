import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [MyGateway],
  exports: [MyGateway],
})
export class GatewayModule {}
