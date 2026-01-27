import { IsOptional, IsString } from 'class-validator';

export class UpdatePortfolioRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
