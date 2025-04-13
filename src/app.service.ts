import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const instanceName = this.configService.get('INSTANCE_NAME');
    console.log('INSTANCE_NAME', instanceName);
    return 'Hello World!';
  }
}
