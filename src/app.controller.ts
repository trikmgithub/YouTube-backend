import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'This is the transcript API';
  }

  @Get('captions')
  async getCaptions(@Query('videoId') videoId: string) {
    if (!videoId) {
      return { error: 'Thiếu videoId' };
    }
    return await this.appService.getCaptions(videoId);
  }

  @Post('transcript')
  async getTranscript(@Body('url') videoUrl: string) {
    return this.appService.getTranscript(videoUrl);
  }
}
