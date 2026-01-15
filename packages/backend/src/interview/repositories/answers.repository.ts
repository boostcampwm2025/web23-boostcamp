import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InterviewAnswer } from '../entities/interview-answer.entity';

@Injectable()
export class AnswersRepository extends Repository<InterviewAnswer> {
  constructor(dataSource: DataSource) {
    super(InterviewAnswer, dataSource.createEntityManager());
  }

  async findFiveByInterviewId(interviewId: string): Promise<InterviewAnswer[]> {
    return this.find({
      where: { interview: { interviewId } },
      order: { createdAt: 'ASC' },
      take: 5,
    });
  }
}
