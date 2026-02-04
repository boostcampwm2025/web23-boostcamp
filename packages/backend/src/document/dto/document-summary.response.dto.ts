import { DocumentType } from '../entities/document.entity';

export class DocumentSummaryListResponse {
  documents: DocumentSummaryResponse[];
  totalPage: number;
}

export class DocumentSummaryResponse {
  documentId: string;
  title: string;
  type: DocumentType;
  createdAt: Date;
  modifiedAt: Date;
}
