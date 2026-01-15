import { IsString, IsNotEmpty } from 'class-validator';

export class InterviewQuestionRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
