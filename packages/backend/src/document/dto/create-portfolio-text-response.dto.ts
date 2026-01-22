import { DocumentType } from '../entities/document.entity';

export class CreatePortfolioTextResponseDto {
  documentId: string;
  type: DocumentType;
  portfolioId: string;
  title: string;
  content: string;
  createdAt: Date;
}
