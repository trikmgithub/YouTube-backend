import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('transcript')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async getTranscript(@Body('url') videoUrl: string) {
    return this.appService.getTranscript(videoUrl);
  }
}
