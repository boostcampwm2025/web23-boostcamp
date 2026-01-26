import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class CoverLetterQnA {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CreateCoverLetterRequestDto {
  @IsString()
  title: string;

  @ValidateNested({ each: true })
  @Type(() => CoverLetterQnA)
  content: CoverLetterQnA[];
}
