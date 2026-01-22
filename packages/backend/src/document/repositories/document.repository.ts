import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';

@Injectable()
export class DocumentRepository extends Repository<Document> {
  constructor(private readonly dataSource: DataSource) {
    super(Document, dataSource.createEntityManager());
  }

  async findOneWithPortfolioById(
    userId: string,
    documentId: string,
  ): Promise<Document | null> {
    return await this.findOne({
      where: {
        documentId,
        user: { userId },
        type: DocumentType.PORTFOLIO,
      },
      relations: {
        portfolio: true,
      },
    });
  }
}
