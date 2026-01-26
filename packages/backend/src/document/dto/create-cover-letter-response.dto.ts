import { DocumentType } from '../entities/document.entity';
import { CoverLetterQnA } from './create-cover-letter-request.dto';

export class CreateCoverLetterResponseDto {
  documentId: string;
  coverLetterId: string;
  type: DocumentType;
  title: string;
  content: CoverLetterQnA[];
  createdAt: Date;
}
