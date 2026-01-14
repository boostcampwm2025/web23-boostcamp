import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import {
  InterviewAnswerVoiceRequest,
  InterviewAnswerChatRequest,
} from './dto/interview-answer-request.dto';
import { InterviewAnswerResponse } from './dto/interview-answer-response.dto';

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) { }

  @Post('answer/voice')
  @UseInterceptors(FileInterceptor('file'))
  async answerWithVoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: InterviewAnswerVoiceRequest,
  ): Promise<InterviewAnswerResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    const answerResult = await this.interviewService.answerWithVoice(
      userId,
      body.interviewId,
      file,
    );

    return {
      answer: answerResult,
    };
  }

  @Post('answer/chat')
  async answerWithChat(
    @Body() body: InterviewAnswerChatRequest,
  ): Promise<InterviewAnswerResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    const answerResult = await this.interviewService.answerWithChat(
      userId,
      body.interviewId,
      body.answer,
    );

    return {
      answer: answerResult,
    };
  }
}
