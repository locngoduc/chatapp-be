import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from './impl/redis.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [RedisProvider, RedisService],
  exports: [RedisService, RedisProvider],
})
export class RedisModule {}
