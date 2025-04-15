// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async addUserInstance(userId: string, instanceName: string) {
    await this.redisClient.rpush(`location:${userId}`, instanceName);
  }

  async removeUserInstance(userId: string, instanceName: string) {
    const key = `location:${userId}`;

    await this.redisClient.lrem(key, 1, instanceName);

    const length = await this.redisClient.llen(key);
    if (length === 0) {
      await this.redisClient.del(key);
    }
  }

  async getUserInstances(userId: string): Promise<string[]> {
    return await this.redisClient.lrange(`location:${userId}`, 0, -1);
  }

  async isUserOnInstance(
    userId: string,
    instanceName: string,
  ): Promise<boolean> {
    const instances = await this.redisClient.lrange(
      `location:${userId}`,
      0,
      -1,
    );
    return instances.includes(instanceName);
  }
}
