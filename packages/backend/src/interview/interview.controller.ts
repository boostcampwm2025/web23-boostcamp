import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { InterviewService } from './interview.service';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) { }

  @Post(':interviewId/answer/voice')
  @UseInterceptors(FileInterceptor('file'))
  async answer(
    @UploadedFile() file: Express.Multer.File,
    @Param('interviewId') interviewId: string,
  ): Promise<string> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    return this.interviewService.answer(userId, interviewId, file);
  }
}