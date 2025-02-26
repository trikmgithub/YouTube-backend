// import { Controller, Get, Post, Body } from '@nestjs/common';
// import { YoutubeTranscript } from 'youtube-transcript';

// @Controller()
// export class AppController {
//   @Post('transcript')
//   async getTranscript(@Body('url') videoUrl: string) {
//     try {
//       // Lấy video ID từ URL
//       const videoId = this.extractVideoId(videoUrl);

//       if (!videoId) {
//         return { error: 'Invalid YouTube URL' };
//       }

//       // Lấy transcript từ YouTube
//       const transcript = await YoutubeTranscript.fetchTranscript(videoId);

//       // Chuyển transcript thành format mong muốn
//       const captions = transcript.map((item) => ({
//         start: item.offset / 100, // chuyển từ milliseconds sang giây
//         duration: item.duration / 100, // chuyển từ milliseconds sang giây
//         text: item.text,
//       }));

//       return { videoId, captions };
//     } catch (error) {
//       return { error: 'Failed to fetch transcript', details: error.message };
//     }
//   }

//   // Hàm tách video ID từ URL YouTube
//   private extractVideoId(url: string): string | null {
//     const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
//     return match ? match[1] : null;
//   }
// }

// -----------
// import { Controller, Get } from '@nestjs/common';

// @Controller()
// export class AppController {
//   private videoId = "IDj1OBG5Tpw";

//   private transcriptEnglish = [
//     { start: 7, duration: 4, text: "According to legend, an emperor long ago declared that he would build" },
//     { start: 11, duration: 3, text: "a great wall spanning thousands of kilometers" },
//     { start: 14, duration: 5, text: "to protect his new empire and ensure his sustained power." },
//     { start: 19, duration: 3, text: "He ordered many men across China to leave their homes" },
//     { start: 22, duration: 4, text: "and submit to the grueling labor required for its construction." },
//     { start: 26, duration: 5, text: "As years passed and the wall grew, few returned home." },
//     { start: 31, duration: 3, text: "Nestled in the foothills of a remote mountain," },
//     { start: 34, duration: 2, text: "the Mengs and their neighbors, the Jiangs," },
//     { start: 36, duration: 4, text: "hadn’t yet had to worry about being drafted by the emperor’s soldiers." },
//     { start: 40, duration: 6, text: "One year, the Mengs grew gourds that flourished along their shared fence." },
//     { start: 46, duration: 5, text: "One particular gourd crossed the fence and extended into the Jiang’s yard," },
//     { start: 51, duration: 1, text: "so they cared for it." },
//     { start: 52, duration: 3, text: "The gourd grew to be the biggest of all." },
//     { start: 55, duration: 5, text: "At harvest, the Mengs and the Jiangs decided to take equal halves." },
//     { start: 60, duration: 5, text: "But as they went to split the gourd, something remarkable happened." },
//     { start: 65, duration: 5, text: "It cracked open to reveal a beautiful baby curled inside, smiling up at them." },
//     { start: 70, duration: 2, text: "They agreed to raise her together" },
//     { start: 72, duration: 4, text: "and named their magical, boundary-breaking daughter, Meng Jiang." },
//     { start: 76, duration: 5, text: "She grew into a virtuous, accomplished young woman who infused life with joy." },
//     { start: 81, duration: 4, text: "She cared for her elderly parents and their land with dedication." },
//     { start: 85, duration: 4, text: "But the surrounding world remained turbulent." },
//     { start: 89, duration: 4, text: "One day, Meng Jiang stumbled upon a young man hiding in the garden." },
//     { start: 93, duration: 5, text: "The emperor’s soldiers had come to conscript him into building the wall." },
//     { start: 98, duration: 4, text: "But he had an elderly mother to care for" },
//     { start: 102, duration: 4, text: "and knew that obeying the soldiers’ orders would mean almost certain death," },
//     { start: 106, duration: 2, text: "so he escaped." },
//     { start: 108, duration: 5, text: "Meng Jiang and Fan Xiliang connected instantly, and soon enough, they married." },
//     { start: 113, duration: 3, text: "But their happiness wouldn’t last long." },
//     { start: 116, duration: 4, text: "When the emperor’s soldiers descended the next time, they captured Fan Xiliang." },
//     { start: 120, duration: 4, text: "For months, she watched the horizon, hoping the world would do right." },
//     { start: 124, duration: 3, text: "But he never came." },
//     { start: 127, duration: 4, text: "And as the air grew frigid, Meng Jiang’s worries only grew," },
//     { start: 131, duration: 3, text: "so she set out to find him herself." },
//     { start: 134, duration: 4, text: "Through bitter snow and howling winds, across rivers and mountains," },
//     { start: 138, duration: 5, text: "she undertook the dangerous journey that many others had been forced to complete." },
//     { start: 143, duration: 4, text: "Finally, she reached the construction site, where thousands of workers toiled." },
//     { start: 147, duration: 5, text: "Stealing into the fray, Meng Jiang whispered her husband’s name to the workers." },
//     { start: 152, duration: 6, text: "One man’s eyes glimmered with recognition—only to reveal the tragic news." },
//     { start: 158, duration: 5, text: "Fan Xiliang had recently died, rumored to be buried under the wall." },
//     { start: 163, duration: 3, text: "Heartbroken beyond words, Meng Jiang could only weep." },
//     { start: 166, duration: 6, text: "Her tears filled the cracks of the wall, soaking its stones." },
//     { start: 172, duration: 6, text: "Whole portions crumbled and washed away in the flood of her grief." },
//     { start: 178, duration: 5, text: "Livid, the emperor ordered that she be captured and punished." },
//     { start: 183, duration: 5, text: "But when he beheld her beauty and virtue, his plan changed." },
//     { start: 188, duration: 6, text: "Leering, the emperor suggested that she become his imperial concubine." },
//     { start: 194, duration: 6, text: "She agreed, but only if he gave Fan Xiliang a grand funeral." },
//     { start: 200, duration: 6, text: "The emperor begrudgingly made the arrangements, and she bid her beloved farewell." },
//     { start: 206, duration: 5, text: "Finally, she refused to submit or face punishment." },
//     { start: 211, duration: 5, text: "Instead, she cast herself into the nearby water, never to emerge again." },
//     { start: 216, duration: 4, text: "She had left an unjust world as mysteriously as she’d entered it." },
//     { start: 220, duration: 5, text: "But her tears flowed on, a reminder of her virtue and defiance." }
// ];

// private transcriptVietnamese = [
//   { start: 7, duration: 4, text: "Theo truyền thuyết, từ lâu một vị hoàng đế đã tuyên bố rằng ông sẽ xây dựng" },
//   { start: 11, duration: 3, text: "một bức tường vĩ đại trải dài hàng nghìn cây số" },
//   { start: 14, duration: 5, text: "để bảo vệ đế chế mới của mình và củng cố quyền lực lâu dài." },
//   { start: 19, duration: 3, text: "Ông ra lệnh cho nhiều người trên khắp Trung Quốc rời khỏi nhà của họ" },
//   { start: 22, duration: 4, text: "và chịu đựng lao động cực khổ để xây dựng bức tường này." },
//   { start: 26, duration: 5, text: "Nhiều năm trôi qua, bức tường ngày càng dài, nhưng ít ai có thể trở về nhà." },
//   { start: 31, duration: 3, text: "Nằm dưới chân một ngọn núi hẻo lánh," },
//   { start: 34, duration: 2, text: "gia đình Mạnh và hàng xóm của họ, gia đình Tưởng," },
//   { start: 36, duration: 4, text: "vẫn chưa phải lo lắng về việc bị quân lính hoàng đế bắt đi." },
//   { start: 40, duration: 6, text: "Một năm nọ, gia đình Mạnh trồng những cây bầu phát triển tươi tốt dọc theo hàng rào chung." },
//   { start: 46, duration: 5, text: "Một quả bầu đặc biệt đã vượt qua hàng rào và lan sang sân nhà Tưởng," },
//   { start: 51, duration: 1, text: "nên họ cũng chăm sóc nó." },
//   { start: 52, duration: 3, text: "Quả bầu đó lớn nhất trong tất cả." },
//   { start: 55, duration: 5, text: "Đến mùa thu hoạch, gia đình Mạnh và gia đình Tưởng quyết định chia đôi quả bầu." },
//   { start: 60, duration: 5, text: "Nhưng khi họ chuẩn bị cắt nó ra, một điều kỳ diệu đã xảy ra." },
//   { start: 65, duration: 5, text: "Nó nứt ra, để lộ một bé gái xinh đẹp cuộn tròn bên trong, mỉm cười với họ." },
//   { start: 70, duration: 2, text: "Họ đồng ý nuôi dưỡng cô bé cùng nhau" },
//   { start: 72, duration: 4, text: "và đặt tên cho cô bé kỳ diệu ấy là Mạnh Tưởng." },
//   { start: 76, duration: 5, text: "Cô bé lớn lên trở thành một thiếu nữ đức hạnh, tài giỏi và mang lại niềm vui cho mọi người." },
//   { start: 81, duration: 4, text: "Cô tận tụy chăm sóc cha mẹ già và mảnh đất của họ." },
//   { start: 85, duration: 4, text: "Nhưng thế giới bên ngoài vẫn đầy biến động." },
//   { start: 89, duration: 4, text: "Một ngày nọ, Mạnh Tưởng tình cờ gặp một chàng trai trẻ đang trốn trong vườn." },
//   { start: 93, duration: 5, text: "Quân lính hoàng đế đã đến để bắt anh đi xây tường thành." },
//   { start: 98, duration: 4, text: "Nhưng anh còn một người mẹ già cần chăm sóc" },
//   { start: 102, duration: 4, text: "và biết rằng nếu đi theo lệnh, anh gần như chắc chắn sẽ bỏ mạng," },
//   { start: 106, duration: 2, text: "nên anh đã trốn chạy." },
//   { start: 108, duration: 5, text: "Mạnh Tưởng và Phạm Hy Lương lập tức gắn kết với nhau, và chẳng bao lâu họ kết hôn." },
//   { start: 113, duration: 3, text: "Nhưng hạnh phúc của họ không kéo dài lâu." },
//   { start: 116, duration: 4, text: "Khi quân lính hoàng đế ập đến lần nữa, họ bắt được Phạm Hy Lương." },
//   { start: 120, duration: 4, text: "Suốt nhiều tháng, cô ngóng nhìn về phía chân trời, hy vọng điều tốt đẹp sẽ đến." },
//   { start: 124, duration: 3, text: "Nhưng anh không bao giờ quay lại." },
//   { start: 127, duration: 4, text: "Và khi không khí trở nên lạnh giá, nỗi lo lắng của Mạnh Tưởng càng lớn dần," },
//   { start: 131, duration: 3, text: "nên cô quyết định tự mình đi tìm anh." },
//   { start: 134, duration: 4, text: "Băng qua tuyết lạnh, gió rít gào, vượt sông suối và núi cao," },
//   { start: 138, duration: 5, text: "cô thực hiện cuộc hành trình đầy nguy hiểm mà bao người khác từng phải trải qua." },
//   { start: 143, duration: 4, text: "Cuối cùng, cô đến công trường xây dựng, nơi hàng ngàn công nhân đang làm việc." },
//   { start: 147, duration: 5, text: "Lẻn vào đám đông, Mạnh Tưởng thì thầm gọi tên chồng mình." },
//   { start: 152, duration: 6, text: "Một người nhận ra cái tên ấy—chỉ để nói với cô tin dữ." },
//   { start: 158, duration: 5, text: "Phạm Hy Lương đã qua đời, và được cho là bị chôn dưới bức tường." },
//   { start: 163, duration: 3, text: "Quá đau khổ, Mạnh Tưởng chỉ biết khóc." },
//   { start: 166, duration: 6, text: "Nước mắt của cô thấm vào những viên đá, len vào từng khe nứt của bức tường." },
//   { start: 172, duration: 6, text: "Từng mảng tường đổ sụp, bị cuốn trôi trong dòng lũ đau thương của cô." },
//   { start: 178, duration: 5, text: "Giận dữ, hoàng đế ra lệnh bắt giữ cô để trừng phạt." },
//   { start: 183, duration: 5, text: "Nhưng khi hắn nhìn thấy vẻ đẹp và phẩm hạnh của cô, kế hoạch của hắn thay đổi." },
//   { start: 188, duration: 6, text: "Với ánh mắt thèm khát, hoàng đế đề nghị cô trở thành phi tần của mình." },
//   { start: 194, duration: 6, text: "Cô đồng ý, nhưng với điều kiện hoàng đế phải tổ chức tang lễ trọng thể cho Phạm Hy Lương." },
//   { start: 200, duration: 6, text: "Dù miễn cưỡng, hoàng đế vẫn chấp nhận, và cô nói lời vĩnh biệt người chồng yêu dấu." },
//   { start: 206, duration: 5, text: "Cuối cùng, cô từ chối phục tùng hoặc chịu hình phạt." },
//   { start: 211, duration: 5, text: "Thay vào đó, cô gieo mình xuống dòng nước gần đó, biến mất mãi mãi." },
//   { start: 216, duration: 4, text: "Cô rời khỏi thế gian bất công này, như cách cô đã đến với nó." },
//   { start: 220, duration: 5, text: "Nhưng nước mắt cô vẫn chảy, như một biểu tượng của lòng trung nghĩa và sự bất khuất." }
// ];

//   // API lấy transcript Tiếng Anh
//   @Get('transcript/english')
//   getTranscriptEnglish() {
//     return { captions: this.transcriptEnglish };
//   }

//   // API lấy transcript Tiếng Việt
//   @Get('transcript/vietnamese')
//   getTranscriptVietnamese() {
//     return { captions: this.transcriptVietnamese };
//   }

//   // API lấy transcript song ngữ
//   @Get('transcript')
//   getTranscriptBilingual() {
//     const captions = this.transcriptEnglish.map((en, index) => ({
//       start: en.start,
//       duration: en.duration,
//       text_en: en.text,
//       text_vi: this.transcriptVietnamese[index]?.text || "",
//     }));

//     return { videoId: this.videoId, captions };
//   }
// }
