import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatPublisher } from './modules/message-queue/publisher';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatPublisher: ChatPublisher,
  ) {}

  @Post()
  async send(@Body() body: { instanceQueue: string; payload: any }) {
    await this.chatPublisher.sendToInstance(body.instanceQueue, body.payload);
    return {
      success: true,
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
