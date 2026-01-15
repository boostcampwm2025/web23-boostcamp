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

@Entity('interviews_answers')
export class InterviewAnswer {
  constructor(content: string) {
    this.content = content;
  }

  @PrimaryGeneratedColumn({ type: 'bigint', name: 'answer_id' })
  answerId: string;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @ManyToOne(() => Interview, (interview) => interview.answers)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;
}
