import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { InterviewType } from '../entities/interview.entity';

export enum SortType {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class InterviewSummaryRequest {
  @IsNumber()
  @Min(0)
  @IsOptional()
  page: number = 0;

  @IsNumber()
  @Min(1)
  @IsOptional()
  take: number = 6;

  @IsEnum(InterviewType)
  @IsOptional()
  type?: InterviewType;

  @IsEnum(SortType)
  @IsOptional()
  sort: SortType = SortType.DESC;
}
