import { IsArray, IsString } from 'class-validator';

export class BulkDeleteDocumentRequestDto {
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];
}
