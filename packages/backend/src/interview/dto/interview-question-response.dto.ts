import { IsString, IsBoolean, IsDate } from 'class-validator';

export class InterviewQuestionResponse {
  @IsString()
  questionId: string;

  @IsString()
  question: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  isLast: boolean;
}
