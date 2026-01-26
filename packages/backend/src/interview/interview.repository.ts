import { DataSource, Repository } from 'typeorm';
import { Interview, InterviewType } from './entities/interview.entity';
import { Injectable } from '@nestjs/common';
import { SortType } from './dto/interview-summary.request.dto';

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

  async findInterviewsPage(
    userId: string,
    page: number,
    take: number,
    type: InterviewType | undefined,
    sort: SortType,
  ): Promise<[Interview[], number]> {
    const skip = page * take;

    const queryBuilder = this.createQueryBuilder('interview');
    queryBuilder.where('interview.user_id = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('interview.type = :type', { type });
    }

    queryBuilder.orderBy('interview.createdAt', sort).skip(skip).take(take);

    return await queryBuilder.getManyAndCount();
  }
}
