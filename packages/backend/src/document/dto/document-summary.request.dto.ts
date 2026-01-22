import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export enum SortType {
  DESC = 'DESC',
  ASC = 'ASC',
}

export class DocumentSummaryRequest {
  @IsNumber()
  @Min(0)
  @IsOptional()
  page: number = 0;

  @IsNumber()
  @Min(1)
  @IsOptional()
  take: number = 6;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsEnum(SortType)
  @IsOptional()
  sort: SortType = SortType.DESC;
}
