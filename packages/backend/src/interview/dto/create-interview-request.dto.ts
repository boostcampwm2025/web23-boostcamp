import { IsArray, IsString } from 'class-validator';

export class CreateInterviewRequestDto {
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];
}
