import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCoverLetterQnA {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class UpdateCoverLetterRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCoverLetterQnA)
  content?: UpdateCoverLetterQnA[];
}
