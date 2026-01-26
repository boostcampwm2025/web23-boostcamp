import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';
import { AIPersona } from './ai-persona.entity';

@Entity('interviews_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'question_id' })
  questionId: string;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @ManyToOne(() => Interview, (interview) => interview.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @ManyToOne(() => AIPersona, (persona) => persona.questions)
  @JoinColumn({ name: 'persona_id' })
  persona: AIPersona;
}
