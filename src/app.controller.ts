import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller chính để xử lý các request liên quan đến phụ đề YouTube
 */
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(private readonly appService: AppService) {}

  /**
   * API endpoint mặc định
   */
  @Get()
  getHello(): string {
    return 'YouTube Transcript API - Sử dụng /captions?videoId=VIDEO_ID hoặc /captions?url=YOUTUBE_URL';
  }

  /**
   * Lấy phụ đề dựa trên ID hoặc URL video
   * @param videoId ID của video YouTube (tùy chọn)
   * @param url URL của video YouTube (tùy chọn)
   * @returns Object chứa phụ đề đa ngôn ngữ
   */
  @Get('captions')
  async getCaptions(@Query('videoId') videoId: string, @Query('url') url: string): Promise<any> {
    const videoInput = videoId || url;
    
    if (!videoInput) {
      this.logger.warn('Yêu cầu thiếu cả videoId và url');
      return { error: 'Vui lòng cung cấp videoId hoặc url' };
    }
    
    this.logger.log(`Đang lấy phụ đề cho: ${videoInput}`);
    return await this.appService.getTranscript(videoInput);
  }
}