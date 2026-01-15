import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CoverLetter } from './cover-letter.entity';

@Entity('cover_letters_question_answer')
export class CoverLetterQuestionAnswer {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'cover_letters_question_answer_id',
  })
  coverLetterQuestionAnswerId: string;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'varchar', length: 255 })
  answer: string;

  @ManyToOne(() => CoverLetter, (coverLetter) => coverLetter.questionAnswers)
  @JoinColumn({ name: 'cover_letter_id' })
  coverLetter: CoverLetter;
}
