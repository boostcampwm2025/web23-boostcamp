import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { Portfolio } from '../entities/portfolio.entity';
import { SortType } from '../dto/document-summary.request.dto';

@Injectable()
export class DocumentRepository extends Repository<Document> {
  constructor(private readonly dataSource: DataSource) {
    super(Document, dataSource.createEntityManager());
  }

  async createPortfolioDocument(
    title: string,
    userId: string,
    content: string,
  ): Promise<Document> {
    return await this.dataSource.transaction(async (manager) => {
      const documentRepo = manager.getRepository(Document);
      const portfolioRepo = manager.getRepository(Portfolio);

      // 1) Document 저장
      const document = await documentRepo.save(
        documentRepo.create({
          type: DocumentType.PORTFOLIO,
          title,
          user: { userId },
        }),
      );

      // 2) Portfolio 저장 (Document와 연결)
      const portfolio = await portfolioRepo.save(
        portfolioRepo.create({
          content,
          document: { documentId: document.documentId },
        }),
      );

      document.portfolio = portfolio;
      return document;
    });
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

  async deletePortfolioDocument(userId: string, documentId: string) {
    await this.dataSource.transaction(async (manager) => {
      const documentRepo = manager.getRepository(Document);
      const portfolioRepo = manager.getRepository(Portfolio);

      const document = await documentRepo.findOne({
        where: {
          documentId,
          user: { userId },
          type: DocumentType.PORTFOLIO,
        },
        relations: { portfolio: true },
      });

      if (!document) {
        throw new NotFoundException('등록되지 않은 문서입니다');
      }

      if (document.portfolio) {
        await portfolioRepo.delete(document.portfolio.portfolioId);
      }
      await documentRepo.delete(document.documentId);
    });
  }
}
