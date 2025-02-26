import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  // Get API key immediately when service initializes to ensure it's available
  private readonly API_KEY = this.configService.get<string>('YOUTUBE_API_KEY');
  
  async getCaptions(videoId: string) {
    try {
      // First try the YoutubeTranscript approach (more reliable)
      try {
        return await this.getTranscriptInternal(videoId);
      } catch (transcriptError) {
        // Fall back to YouTube API if YoutubeTranscript fails
        // Lấy danh sách phụ đề có sẵn
        const captionsList = await this.fetchCaptionsList(videoId);
        if (!captionsList || captionsList.length === 0) {
          return { error: 'Không tìm thấy phụ đề cho video này' };
        }

        // Lọc phụ đề tiếng Anh và tiếng Việt từ danh sách
        const englishCaption = captionsList.find((cap) => cap.language === 'en');
        const vietnameseCaption = captionsList.find(
          (cap) => cap.language === 'vi',
        );

        if (!englishCaption) {
          return { error: 'Không tìm thấy phụ đề tiếng Anh' };
        }

        // Lấy nội dung phụ đề
        const transcriptEnglish = await this.fetchCaptionContent(
          englishCaption.id,
        );
        const transcriptVietnamese = vietnameseCaption
          ? await this.fetchCaptionContent(vietnameseCaption.id)
          : [];

        // Đồng bộ phụ đề
        const captions = this.syncCaptions(
          transcriptEnglish,
          transcriptVietnamese,
        );

        return { videoId, captions };
      }
    } catch (error) {
      console.error('Error in getCaptions:', error);
      return { 
        error: 'Lỗi khi lấy phụ đề', 
        details: error.message,
        suggestion: 'Hãy kiểm tra API_KEY trong file .env có đúng không và đã được bật cho YouTube Data API v3'
      };
    }
  }

  // 📌 Lấy danh sách phụ đề của video
  private async fetchCaptionsList(videoId: string) {
    if (!this.API_KEY) {
      throw new Error('API_KEY is missing in environment variables');
    }
    
    const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${this.API_KEY}`;
    console.log('Fetching captions list from URL:', url);
    
    try {
      const response = await axios.get(url);
      return response.data.items.map((item) => ({
        id: item.id,
        language: item.snippet.language,
      }));
    } catch (error) {
      console.error('Failed to fetch captions list:', error.response?.data || error.message);
      throw error;
    }
  }

  // 📌 Lấy nội dung phụ đề dựa trên ID
  private async fetchCaptionContent(captionId: string) {
    if (!this.API_KEY) {
      throw new Error('API_KEY is missing in environment variables');
    }
    
    const url = `https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${this.API_KEY}`;
    const response = await axios.get(url);
    return this.parseSRT(response.data);
  }

  // 📌 Chuyển SRT thành mảng JSON
  private parseSRT(srtData: string) {
    return srtData
      .split('\n\n')
      .map((block) => {
        const lines = block.split('\n');
        if (lines.length < 2) return null;

        const timeMatch = lines[1].match(
          /(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)/,
        );
        if (!timeMatch) return null;

        // Extract start time with milliseconds
        const startSeconds = this.formatTimesWithMilliseconds(
          timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]
        );
        // Extract end time with milliseconds
        const endSeconds = this.formatTimesWithMilliseconds(
          timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]
        );
        // Calculate actual duration
        const duration = endSeconds - startSeconds;

        return {
          start: startSeconds * 1000, // Chuyển đổi giây thành mili giây
          duration: duration * 1000, // Chuyển đổi giây thành mili giây
          text: lines.slice(2).join(' '),
        };
      })
      .filter(Boolean);
  }

  // 📌 Chuyển đổi thời gian hh:mm:ss,ms thành giây với độ chính xác millisecond
  private formatTimesWithMilliseconds(h: string, m: string, s: string, ms: string) {
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
  }

  // 📌 Đồng bộ phụ đề tiếng Anh & tiếng Việt
  private syncCaptions(transcriptEnglish, transcriptVietnamese) {
    const findClosestMatch = (targetTime, transcripts) => {
      return transcripts.reduce((closest, item) => {
        return Math.abs(item.start - targetTime) <
          Math.abs(closest.start - targetTime)
          ? item
          : closest;
      }, transcripts[0]);
    };

    return transcriptEnglish.map((item) => {
      const vietnameseMatch =
        transcriptVietnamese.length > 0
          ? findClosestMatch(item.start, transcriptVietnamese)
          : { text: '' };

      return {
        start: item.start,
        duration: item.duration,
        english: item.text,
        vietnamese: vietnameseMatch.text || '',
      };
    });
  }

  //-------------------
  // Phương thức cải tiến, sử dụng thư viện YoutubeTranscript trước (không yêu cầu API key)
  private async getTranscriptInternal(videoId: string) {
    try {
      const transcriptEnglish = await YoutubeTranscript.fetchTranscript(
        videoId,
        { lang: 'en' },
      );
      
      let transcriptVietnamese = [];
      try {
        transcriptVietnamese = await YoutubeTranscript.fetchTranscript(
          videoId,
          { lang: 'vi' },
        );
      } catch (error) {
        console.log('Vietnamese transcript not available:', error.message);
        // Continue without Vietnamese transcript
      }

      // Hàm tìm câu tiếng Việt có thời gian gần nhất với câu tiếng Anh
      const findClosestMatch = (targetTime, transcripts) => {
        if (!transcripts || transcripts.length === 0) return null;
        
        return transcripts.reduce((closest, item) => {
          return Math.abs(item.offset - targetTime) <
            Math.abs(closest.offset - targetTime)
            ? item
            : closest;
        }, transcripts[0]);
      };

      // Đồng bộ transcript tiếng Anh với câu tiếng Việt gần nhất
      const captions = transcriptEnglish.map((item) => {
        const vietnameseMatch = transcriptVietnamese.length > 0 
          ? findClosestMatch(item.offset, transcriptVietnamese)
          : null;

        return {
          start: item.offset, // Giữ nguyên giá trị miligiây
          duration: item.duration, // Giữ nguyên giá trị miligiây
          english: this.formatText(item.text),
          vietnamese: this.formatText(vietnameseMatch?.text || ''),
        };
      });

      return { videoId, captions };
    } catch (error) {
      throw error; // Rethrow to fallback to the API method
    }
  }

  async getTranscript(videoUrl: string) {
    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        return { error: 'Invalid YouTube URL' };
      }

      return this.getTranscriptInternal(videoId);
    } catch (error) {
      return { error: 'Failed to fetch transcript', details: error.message };
    }
  }

  // This method is no longer used in getTranscriptInternal
  formatTime(seconds: number): number {
    return Math.floor(seconds);
  }

  formatText(text: string): string {
    return text.replace(/\n/g, ' ').replace(/&amp;#39;/g, "'");
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    );
    
    if (match) return match[1];
    
    // Also support youtu.be URLs
    const shortMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/
    );
    
    return shortMatch ? shortMatch[1] : null;
  }
}