import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Interview } from './interview.entity';
import { Problem } from './problem.entity';

export enum ProgrammingLanguage {
  JS = 'JS',
}

@Entity('live_coding_interviews')
export class LiveCodingInterview {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'live_coding_interviews_id' })
  liveCodingInterviewId: string;

  @Column({
    type: 'enum',
    enum: ProgrammingLanguage,
    default: ProgrammingLanguage.JS,
  })
  language: ProgrammingLanguage;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ name: 'feedback_content', type: 'varchar', length: 255 })
  feedbackContent: string;

  @OneToOne(() => Interview, (interview) => interview.liveCoding)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @OneToMany(() => Problem, (problem) => problem.liveCodingInterview)
  problems: Problem[];
}
