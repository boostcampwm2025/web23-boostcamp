import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateInterviewRequestDto {
  @IsString()
  @IsNotEmpty()
  simulationTitle: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  documentIds: string[];
}
