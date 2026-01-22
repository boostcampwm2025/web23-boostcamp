import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePortfolioTextRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
