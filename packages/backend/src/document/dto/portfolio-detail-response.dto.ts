import { DocumentType } from '../entities/document.entity';

export class PortfolioDetailResponseDto {
  documentId: string;
  type: DocumentType;
  portfolioId: string;
  title: string;
  content: string;
  createdAt: Date;
  modifiedAt: Date;
}
