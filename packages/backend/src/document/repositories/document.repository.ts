import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { Portfolio } from '../entities/portfolio.entity';

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
}
