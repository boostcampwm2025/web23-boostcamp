import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { CoverLetterQuestionAnswer } from './cover-letter-question-answer.entity';

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'cover_letters_id' })
  coverLetterId: string;

  @OneToOne(() => Document, (document) => document.coverLetter, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documents_id' })
  document: Document;

  @OneToMany(() => CoverLetterQuestionAnswer, (qa) => qa.coverLetter, {
    cascade: [`insert`, `update`],
  })
  questionAnswers: CoverLetterQuestionAnswer[];
}
