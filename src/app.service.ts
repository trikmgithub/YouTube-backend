import { Injectable, Logger } from '@nestjs/common';
import { YoutubeTranscript } from 'youtube-transcript';

interface Caption {
  start: number;
  duration: number;
  english: string;
  vietnamese: string;
  japanese: string;
  german: string;
}

interface TranscriptResult {
  videoId?: string;
  captions?: Caption[];
  error?: string;
  details?: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  /**
   * Lấy phụ đề cho một video YouTube dựa trên ID video
   * @param videoId ID của video YouTube
   * @returns Object chứa phụ đề đã đồng bộ hoặc thông báo lỗi
   */
  async getCaptions(videoId: string): Promise<TranscriptResult> {
    try {
      return await this.getTranscript(videoId);
    } catch (error) {
      this.logger.error(`Error in getCaptions: ${error.message}`, error.stack);
      return { 
        error: 'Lỗi khi lấy phụ đề', 
        details: error.message
      };
    }
  }

  /**
   * Lấy phụ đề cho một video YouTube dựa trên URL hoặc ID
   * @param videoInput URL hoặc ID của video YouTube
   * @returns Object chứa phụ đề đã đồng bộ hoặc thông báo lỗi
   */
  async getTranscript(videoInput: string): Promise<TranscriptResult> {
    try {
      // Xác định đầu vào là URL hay ID
      const videoId = this.isUrl(videoInput) ? this.extractVideoId(videoInput) : videoInput;
      
      if (!videoId) {
        return { error: 'URL hoặc ID YouTube không hợp lệ' };
      }

      // Lấy phụ đề tiếng Anh (ngôn ngữ chính)
      const transcriptEnglish = await this.fetchTranscriptSafely(videoId, 'en');
      
      if (!transcriptEnglish || transcriptEnglish.length === 0) {
        return { error: 'Không tìm thấy phụ đề tiếng Anh cho video này' };
      }
      
      // Khởi tạo phụ đề các ngôn ngữ khác
      const transcriptVietnamese = await this.fetchTranscriptSafely(videoId, 'vi');
      const transcriptJapanese = await this.fetchTranscriptSafely(videoId, 'ja');
      const transcriptGerman = await this.fetchTranscriptSafely(videoId, 'de');

      // Đồng bộ phụ đề các ngôn ngữ với phụ đề tiếng Anh
      const syncedCaptions = this.syncMultiLanguageCaptions(
        transcriptEnglish, 
        transcriptVietnamese, 
        transcriptJapanese, 
        transcriptGerman
      );
      
      // Gộp các phụ đề liên tiếp thành các đoạn lớn hơn
      const combinedCaptions = this.combineCaptions(syncedCaptions);

      return { videoId, captions: combinedCaptions };
    } catch (error) {
      this.logger.error(`Failed to fetch transcript: ${error.message}`, error.stack);
      return { 
        error: 'Không lấy được phụ đề', 
        details: error.message 
      };
    }
  }

  /**
   * Lấy phụ đề cho một ngôn ngữ cụ thể, xử lý lỗi an toàn
   * @param videoId ID của video YouTube
   * @param langCode Mã ngôn ngữ (en, vi, ja, de)
   * @returns Mảng phụ đề hoặc mảng rỗng nếu có lỗi
   */
  private async fetchTranscriptSafely(videoId: string, langCode: string): Promise<any[]> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: langCode });
      this.logger.log(`Đã lấy được phụ đề ${langCode} cho video ${videoId}`);
      return transcript;
    } catch (error) {
      this.logger.warn(`Không lấy được phụ đề ${langCode} cho video ${videoId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Đồng bộ phụ đề đa ngôn ngữ với phụ đề tiếng Anh
   * @param transcriptEnglish Mảng phụ đề tiếng Anh
   * @param transcriptVietnamese Mảng phụ đề tiếng Việt
   * @param transcriptJapanese Mảng phụ đề tiếng Nhật
   * @param transcriptGerman Mảng phụ đề tiếng Đức
   * @returns Mảng phụ đề đã đồng bộ với nhiều ngôn ngữ
   */
  private syncMultiLanguageCaptions(
    transcriptEnglish: any[], 
    transcriptVietnamese: any[] = [], 
    transcriptJapanese: any[] = [], 
    transcriptGerman: any[] = []
  ): Caption[] {
    // Hàm tìm phụ đề có thời gian gần nhất với mốc thời gian đích
    const findClosestMatch = (targetTime: number, transcripts: any[]): any | null => {
      if (!transcripts || transcripts.length === 0) return null;
      
      return transcripts.reduce((closest, item) => {
        return Math.abs(item.offset - targetTime) < Math.abs(closest.offset - targetTime)
          ? item
          : closest;
      }, transcripts[0]);
    };

    // Đồng bộ phụ đề các ngôn ngữ với phụ đề tiếng Anh
    return transcriptEnglish.map((item) => {
      const vietnameseMatch = transcriptVietnamese.length > 0 
        ? findClosestMatch(item.offset, transcriptVietnamese)
        : null;
        
      const japaneseMatch = transcriptJapanese.length > 0 
        ? findClosestMatch(item.offset, transcriptJapanese)
        : null;
        
      const germanMatch = transcriptGerman.length > 0 
        ? findClosestMatch(item.offset, transcriptGerman)
        : null;

      return {
        start: item.offset,
        duration: item.duration,
        english: this.formatText(item.text),
        vietnamese: this.formatText(vietnameseMatch?.text || ''),
        japanese: this.formatText(japaneseMatch?.text || ''),
        german: this.formatText(germanMatch?.text || '')
      };
    });
  }
  
  /**
   * Gộp các phụ đề liên tiếp thành một đoạn với duration tổng hợp
   * @param captions Mảng phụ đề đã đồng bộ
   * @returns Mảng phụ đề đã được gộp
   */
  private combineCaptions(captions: Caption[]): Caption[] {
    if (!captions || captions.length === 0) return [];
    
    // Khởi tạo với phụ đề đầu tiên
    const combined: Caption[] = [{
      start: captions[0].start,
      duration: captions[0].duration,
      english: captions[0].english,
      vietnamese: captions[0].vietnamese,
      japanese: captions[0].japanese,
      german: captions[0].german
    }];
    
    // Duyệt qua các phụ đề từ vị trí thứ 2 trở đi
    for (let i = 1; i < captions.length; i++) {
      const current = captions[i];
      const last = combined[combined.length - 1];
      
      // Tính khoảng cách thời gian giữa thời điểm kết thúc phụ đề trước và thời điểm bắt đầu phụ đề hiện tại
      const timeGap = current.start - (last.start + last.duration);
      
      // Kiểm tra nếu nội dung có vẻ là một câu hoàn chỉnh
      const lastEndsWithPunctuation = /[.!?]$/.test(last.english.trim());
      const currentIsSentenceStart = /^[A-Z]/.test(current.english.trim()) || /^["\']/.test(current.english.trim());
      const seemsNewSentence = lastEndsWithPunctuation && currentIsSentenceStart;
      
      // Các điều kiện để tạo một phụ đề mới:
      // 1. Khoảng cách thời gian > 0.8 giây
      // 2. Phụ đề hiện tại có duration > 15 giây
      // 3. Có dấu hiệu là câu mới bắt đầu
      // 4. Tổng độ dài văn bản > 150 ký tự (quá dài để đọc trong một khung hình)
      if (
        timeGap > 0.8 || 
        last.duration > 15 || 
        seemsNewSentence ||
        (last.english.length + current.english.length > 150)
      ) {
        combined.push({
          start: current.start,
          duration: current.duration,
          english: current.english,
          vietnamese: current.vietnamese,
          japanese: current.japanese,
          german: current.german
        });
      } else {
        // Kết hợp phụ đề hiện tại vào phụ đề trước đó
        last.duration = (current.start + current.duration) - last.start;
        
        // Kết hợp văn bản các ngôn ngữ
        this.combineText(last, current, 'english');
        this.combineText(last, current, 'vietnamese');
        this.combineText(last, current, 'japanese');
        this.combineText(last, current, 'german');
      }
    }
    
    // Làm sạch văn bản cuối cùng
    combined.forEach(caption => {
      caption.english = this.cleanText(caption.english);
      caption.vietnamese = this.cleanText(caption.vietnamese);
      caption.japanese = this.cleanText(caption.japanese);
      caption.german = this.cleanText(caption.german);
    });
    
    return combined;
  }

  /**
   * Kết hợp văn bản từ phụ đề mới vào phụ đề cũ
   * @param target Phụ đề đích
   * @param source Phụ đề nguồn
   * @param language Ngôn ngữ cần kết hợp
   */
  private combineText(target: any, source: any, language: string): void {
    if (!source[language]) return;
    
    const needSpace = target[language] && !target[language].endsWith(' ') && !source[language].startsWith(' ');
    target[language] += source[language] ? (needSpace ? ' ' : '') + source[language] : '';
  }

  /**
   * Định dạng lại văn bản phụ đề
   * @param text Văn bản cần định dạng
   * @returns Văn bản đã định dạng
   */
  private formatText(text: string): string {
    if (!text) return '';
    return text.replace(/\n/g, ' ').replace(/&amp;#39;/g, "'");
  }
  
  /**
   * Làm sạch văn bản, loại bỏ khoảng trắng thừa và sửa một số lỗi thường gặp
   * @param text Văn bản cần làm sạch
   * @returns Văn bản đã được làm sạch
   */
  private cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Loại bỏ khoảng trắng thừa ở đầu và cuối
      .trim()
      // Loại bỏ nhiều khoảng trắng liên tiếp
      .replace(/\s+/g, ' ')
      // Sửa lỗi "d the" thành "the"
      .replace(/\bd\s+the\b/gi, ' the')
      // Đảm bảo khoảng trắng sau dấu câu
      .replace(/([.!?])([A-Z])/g, '$1 $2')
      // Sửa một số lỗi khác thường gặp trong phụ đề YouTube
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      // Chuẩn hóa ký tự âm nhạc
      .replace(/\[Music\]/gi, '[Music]')
      .replace(/\[Nhạc\]/gi, '[Nhạc]');
  }

  /**
   * Kiểm tra xem một chuỗi có phải là URL hay không
   * @param str Chuỗi cần kiểm tra
   * @returns true nếu là URL, ngược lại false
   */
  private isUrl(str: string): boolean {
    return str.includes('youtube.com') || str.includes('youtu.be');
  }

  /**
   * Trích xuất ID video từ URL YouTube
   * @param url URL YouTube
   * @returns ID video hoặc null nếu URL không hợp lệ
   */
  private extractVideoId(url: string): string | null {
    // Xử lý URL youtube.com/watch?v=
    const watchMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/
    );
    if (watchMatch) return watchMatch[1];
    
    // Xử lý URL dạng rút gọn youtu.be/
    const shortMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/
    );
    
    // Xử lý URL nhúng youtube.com/embed/
    const embedMatch = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&]+)/
    );
    
    if (watchMatch) return watchMatch[1];
    if (shortMatch) return shortMatch[1];
    if (embedMatch) return embedMatch[1];
    
    return null;
  }
}