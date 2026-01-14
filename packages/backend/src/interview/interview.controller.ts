import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { InterviewAnswerRequest } from './dto/interview-answer-request.dto';
import { InterviewAnswerResponse } from './dto/interview-answer-response.dto';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('answer/voice')
  @UseInterceptors(FileInterceptor('file'))
  async answer(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: InterviewAnswerRequest,
  ): Promise<InterviewAnswerResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    const answerResult = await this.interviewService.answer(
      userId,
      body.interviewId,
      file,
    );

    return {
      answer: answerResult,
    };
  }
}
