import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';

@Injectable()
export class PortfolioRepository extends Repository<Portfolio> {
  constructor(dataSource: DataSource) {
    super(Portfolio, dataSource.createEntityManager());
  }

  async findByDocumentId(documentId: string): Promise<Portfolio | null> {
    return this.findOne({
      where: { document: { documentId } },
    });
  }
}
