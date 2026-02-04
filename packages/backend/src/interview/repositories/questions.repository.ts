import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InterviewQuestion } from '../entities/interview-question.entity';
import { Interview } from '../entities/interview.entity';

@Injectable()
export class QuestionsRepository extends Repository<InterviewQuestion> {
  constructor(dataSource: DataSource) {
    super(InterviewQuestion, dataSource.createEntityManager());
  }

  async findFiveByInterviewId(
    interviewId: string,
  ): Promise<InterviewQuestion[]> {
    return this.find({
      where: { interview: { interviewId } },
      order: { createdAt: 'ASC' },
      take: 5,
    });
  }

  async createQuestion(
    content: string,
    interviewId: string,
  ): Promise<InterviewQuestion> {
    return this.save({
      content,
      interview: { interviewId } as Interview,
    });
  }
}
