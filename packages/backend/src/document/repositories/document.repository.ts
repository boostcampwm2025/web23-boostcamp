import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Document } from '../entities/document.entity';

@Injectable()
export class DocumentRepository extends Repository<Document> {
  constructor(dataSource: DataSource) {
    super(Document, dataSource.createEntityManager());
  }

  async findByIds(ids: string[]): Promise<Document[]> {
    return this.find({
      where: {
        documentId: In(ids),
      },
    });
  }
}
