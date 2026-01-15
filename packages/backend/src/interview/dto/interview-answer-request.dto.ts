import { IsString, IsNotEmpty } from 'class-validator';

export class InterviewAnswerVoiceRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}

export class InterviewAnswerChatRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
