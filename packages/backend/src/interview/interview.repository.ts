import { DataSource, Repository } from 'typeorm';
import { Interview } from './entities/interview.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InterviewRepository extends Repository<Interview> {
  constructor(private readonly dataSource: DataSource) {
    super(Interview, dataSource.createEntityManager());
  }

  async findById(
    interviewId: string,
    relations: string[] = [],
  ): Promise<Interview | null> {
    return this.findOne({ where: { interviewId: interviewId }, relations });
  }
}
