import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CoverLetterQnA {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CreateCoverLetterRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @ValidateNested({ each: true })
  @Type(() => CoverLetterQnA)
  content: CoverLetterQnA[];
}
