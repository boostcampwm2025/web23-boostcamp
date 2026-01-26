import { DocumentType } from '../entities/document.entity';

export class ViewCoverLetterResponseDto {
  documentId: string;
  coverLetterId: string;
  type: DocumentType;
  title: string;
  content: {
    question: string;
    answer: string;
  }[];
  createdAt: Date;
}
