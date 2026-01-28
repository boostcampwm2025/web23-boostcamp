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

import { GetUser } from '../auth/decorator/get-user.decorator';

@Controller('interview')
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);
  constructor(private readonly interviewService: InterviewService) {}

  @Post('tech/create')
  async createTechInterview(
    @GetUser() userId: string,
    @Body() body: CreateInterviewRequestDto,
  ): Promise<CreateInterviewResponseDto> {
    return await this.interviewService.createTechInterview(userId, body);
  }

  @Post('answer/voice')
  @UseInterceptors(FileInterceptor('file'))
  async answerWithVoice(
    @GetUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: InterviewAnswerVoiceRequest,
  ): Promise<InterviewAnswerResponse> {
    if (!file) {
      this.logger.warn(
        `answer/voice 요청에 음성 파일이 누락 되었습니다. - interviewId=${body.interviewId}`,
      );
      throw new BadRequestException('음성 파일이 없습니다.');
    }

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
    @GetUser() userId: string,
    @Body() body: InterviewAnswerChatRequest,
  ): Promise<InterviewAnswerResponse> {
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
  async stopInterview(
    @GetUser() userId: string,
    @Body() body: InterviewStopRequest,
  ): Promise<void> {
    const endTime = new Date();
    await this.interviewService.calculateInterviewTime(
      userId,
      body.interviewId,
      endTime,
    );
  }

  @Get('/:interviewId/chat/history')
  async getInterviewChatHistory(
    @GetUser() userId: string,
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewChatHistoryResponse> {
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
    @GetUser() userId: string,
    @Body() body: CreateFeedbackRequest,
  ): Promise<InterviewFeedbackResponse> {
    return await this.interviewService.createInterviewFeedback(
      userId,
      body.interviewId,
    );
  }

  @Get(':interviewId/time')
  async getDuringTime(
    @GetUser() userId: string,
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewDuringTimeResponse> {
    return await this.interviewService.getInterviewTime(userId, interviewId);
  }

  @Get('/:interviewId/feedback')
  async getInterviewFeedback(
    @GetUser() userId: string,
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewFeedbackResponse> {
    return this.interviewService.findInterviewFeedback(userId, interviewId);
  }

  @Get()
  async getInterviewList(
    @GetUser() userId: string,
    @Query() dto: InterviewSummaryRequest,
  ): Promise<InterviewSummaryListResponse> {
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
    @GetUser() userId: string,
    @Param('interviewId') interviewId: string,
  ): Promise<void> {
    await this.interviewService.deleteInterview(userId, interviewId);
  }
}
