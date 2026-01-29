import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import {
  InterviewAnswerVoiceRequest,
  InterviewAnswerChatRequest,
} from './dto/interview-answer-request.dto';
import { InterviewAnswerResponse } from './dto/interview-answer-response.dto';
import { InterviewChatHistoryResponse } from './dto/interview-chat-history-response.dto';
import { InterviewQuestionRequest } from './dto/interview-question-request.dto';
import { InterviewQuestionResponse } from './dto/interview-question-response.dto';
import { InterviewDuringTimeResponse } from './dto/interview-during-time-response.dto';
import { InterviewStopRequest } from './dto/interview-stop-request.dto';
import { CreateInterviewRequestDto } from './dto/create-interview-request.dto';
import { CreateInterviewResponseDto } from './dto/create-interview-response.dto';
import { CreateFeedbackRequest } from './dto/create-feedback-request.dto';
import { InterviewFeedbackResponse } from './dto/interview-feedback-response.dto';
import { InterviewSummaryRequest } from './dto/interview-summary.request.dto';
import { InterviewSummaryListResponse } from './dto/interview-summary.response.dto';

@Controller('interview')
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);
  constructor(private readonly interviewService: InterviewService) {}

  @Post('tech/create')
  async createTechInterview(
    @Body() body: CreateInterviewRequestDto,
  ): Promise<CreateInterviewResponseDto> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    return await this.interviewService.createTechInterview(userId, body);
  }

  @Post('answer/voice')
  @UseInterceptors(FileInterceptor('file'))
  async answerWithVoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: InterviewAnswerVoiceRequest,
  ): Promise<InterviewAnswerResponse> {
    if (!file) {
      this.logger.warn(
        `answer/voice 요청에 음성 파일이 누락 되었습니다. - interviewId=${body.interviewId}`,
      );
      throw new BadRequestException('음성 파일이 없습니다.');
    }

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

  @Post('/stop')
  async stopInterview(@Body() body: InterviewStopRequest): Promise<void> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    const endTime = new Date();
    await this.interviewService.calculateInterviewTime(
      userId,
      body.interviewId,
      endTime,
    );
  }

  @Get('/:interviewId/chat/history')
  async getInterviewChatHistory(
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewChatHistoryResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    return this.interviewService.findInterviewChatHistory(userId, interviewId);
  }

  @Post('tech/question')
  async getIntervalQuestion(
    @Body() body: InterviewQuestionRequest,
  ): Promise<InterviewQuestionResponse> {
    const userId = '1';
    return await this.interviewService.chatInterviewer(
      userId,
      body.interviewId,
    );
  }

  @Post('/feedback')
  async generateAiInterview(
    @Body() body: CreateFeedbackRequest,
  ): Promise<InterviewFeedbackResponse> {
    const userId = '1';
    return await this.interviewService.createInterviewFeedback(
      userId,
      body.interviewId,
    );
  }

  @Get(':interviewId/time')
  async getDuringTime(
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewDuringTimeResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    return await this.interviewService.getInterviewTime(userId, interviewId);
  }

  @Get('/:interviewId/feedback')
  async getInterviewFeedback(
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewFeedbackResponse> {
    // 인증이 없기 때문에 userId를 상수화
    const userId = '1';
    return this.interviewService.findInterviewFeedback(userId, interviewId);
  }

  @Get()
  async getInterviewList(
    @Query() dto: InterviewSummaryRequest,
  ): Promise<InterviewSummaryListResponse> {
    const userId = '1';
    const { page, take, type, sort } = dto;
    return await this.interviewService.listInterviews(
      userId,
      page,
      take,
      type,
      sort,
    );
  }

  @Delete(':interviewId')
  @HttpCode(204)
  async deleteInterview(
    @Param('interviewId') interviewId: string,
  ): Promise<void> {
    const userId = '1';
    await this.interviewService.deleteInterview(userId, interviewId);
  }
}
