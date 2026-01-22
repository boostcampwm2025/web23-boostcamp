import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';

@Injectable()
export class DocumentRepository extends Repository<Document> {
  constructor(dataSource: DataSource) {
    super(Document, dataSource.createEntityManager());
  }

  async createPortfolioDocument(
    title: string,
    userId: string,
  ): Promise<Document> {
    return this.save({
      type: DocumentType.PORTFOLIO,
      title: title,
      user: { userId },
    });
  }

  async findByIds(ids: string[]): Promise<Document[]> {
    return this.find({
      where: {
        documentId: In(ids),
      },
    });
  }
}
