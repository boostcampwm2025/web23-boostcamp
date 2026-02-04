import { IsString, IsNotEmpty } from 'class-validator';

export class InterviewStopRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
