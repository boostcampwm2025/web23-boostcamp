import { IsString, IsNotEmpty } from 'class-validator';

export class InterviewAnswerRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
