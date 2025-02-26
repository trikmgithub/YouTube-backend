import { Injectable } from '@nestjs/common';
import { YoutubeTranscript } from 'youtube-transcript';

@Injectable()
export class AppService {
  async getTranscript(videoUrl: string) {
    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        return { error: 'Invalid YouTube URL' };
      }

      const transcriptEnglish = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      const transcriptVietnamese = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'vi' });

      // Hàm tìm câu tiếng Việt có thời gian gần nhất với câu tiếng Anh
      const findClosestMatch = (targetTime, transcripts) => {
        return transcripts.reduce((closest, item) => {
          return Math.abs(item.offset - targetTime) < Math.abs(closest.offset - targetTime) ? item : closest;
        }, transcripts[0]);
      };

      // Đồng bộ transcript tiếng Anh với câu tiếng Việt gần nhất
      const captions = transcriptEnglish.map((item) => {
        const vietnameseMatch = findClosestMatch(item.offset, transcriptVietnamese);

        return {
          start: this.formatTime(item.offset),
          duration: this.formatTime(item.duration),
          english: this.formatText(item.text),
          vietnamese: this.formatText(vietnameseMatch?.text || ''),
        };
      });

      return { videoId, captions };
    } catch (error) {
      return { error: 'Failed to fetch transcript', details: error.message };
    }
  }

  formatTime(seconds: number): number {
    return Math.floor(seconds);
  }

  formatText(text: string): string {
    return text.replace(/\n/g, ' ').replace(/&amp;#39;/g, "'");
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    return match ? match[1] : null;
  }
}
