import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { RedisModule } from '../redis/redis.module';
import { DictionaryService } from './dictionary.service';

@Module({
  imports: [RedisModule],
  providers: [MyGateway, DictionaryService],
  exports: [MyGateway, DictionaryService],
})
export class GatewayModule {}
