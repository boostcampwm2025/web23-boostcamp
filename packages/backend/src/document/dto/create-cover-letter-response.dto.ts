export class CreateCoverLetterResponseDto {
  documentId: string;
  coverletterId: string;
  type: string;
  title: string;
  content: {
    question: string;
    answer: string;
  }[];
  createdAt: Date;
}
