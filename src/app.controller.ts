import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('transcript')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get()
  getHello(): string {
    return 'This is the transcript API';
  }

  @Post()
  async getTranscript(@Body('url') videoUrl: string) {
    return this.appService.getTranscript(videoUrl);
  }
}
