import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { SortType } from '../dto/document-summary.request.dto';

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

  async findDocumentsPage(
    userId: string,
    page: number,
    take: number,
    type: DocumentType | undefined,
    sort: SortType,
  ): Promise<[Document[], number]> {
    const skip = page * take;

    const queryBuilder = this.createQueryBuilder('document');
    queryBuilder.where('document.user_id = :userId', { userId });
    if (type) {
      queryBuilder.andWhere('document.type = :type', { type });
    }

    queryBuilder.orderBy('document.createdAt', sort).skip(skip).take(take);

    return await queryBuilder.getManyAndCount();
  }
}
