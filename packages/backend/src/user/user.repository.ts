import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(userId: string): Promise<User | null> {
    return this.findOne({ where: { userId: userId } });
  }

  async findBySub(sub: string): Promise<User | null> {
    return this.findOne({ where: { sub: sub } });
  }
}
