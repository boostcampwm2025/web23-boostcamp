import {IsNotEmpty, IsString} from 'class-validator';

export class CreateFeedbackRequest {
  @IsString()
  @IsNotEmpty()
  interviewId: string;
}
