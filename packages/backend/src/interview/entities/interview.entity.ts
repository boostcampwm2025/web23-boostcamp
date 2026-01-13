import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { InterviewQuestion } from './interview-question.entity';
import { InterviewAnswer } from './interview-answer.entity';
import { LiveCodingInterview } from './live-coding-interview.entity';
import { TechnicalInterview } from './technical-interview.entity';
import { ForbiddenException } from '@nestjs/common';

export enum InterviewType {
  TECH = 'TECH',
  CODE = 'CODE',
}

export enum LikeStatus {
  NONE = 'NONE',
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'interview_id' })
  interviewId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: InterviewType })
  type: InterviewType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: LikeStatus,
    name: 'like_status',
    default: LikeStatus.NONE,
  })
  likeStatus: LikeStatus;

  @Column({ name: 'during_time', type: 'timestamp' })
  duringTime: Date;

  @ManyToOne(() => User, (user) => user.interviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => InterviewQuestion, (question) => question.interview)
  questions: InterviewQuestion[];

  @OneToMany(() => InterviewAnswer, (answer) => answer.interview, {
    cascade: ['insert'],
  })
  answers: InterviewAnswer[];

  @OneToOne(() => LiveCodingInterview, (live) => live.interview)
  liveCoding: LiveCodingInterview;

  @OneToOne(() => TechnicalInterview, (tech) => tech.interview)
  technical: TechnicalInterview;

  validateUser(userId: string) {
    if (this.user.userId !== userId) {
      throw new ForbiddenException('인터뷰 소유자 이외의 접근입니다.');
    }
  }
}
