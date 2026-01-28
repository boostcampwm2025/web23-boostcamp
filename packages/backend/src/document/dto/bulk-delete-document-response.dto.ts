export class BulkDeleteDocumentResponseDto {
  success: boolean;
  requestedCount: number;
  deletedCount: number;
  failedDocuments: string[];
}
