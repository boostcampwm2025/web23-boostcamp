import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { UserRepository } from '../user/user.repository';
import { DataSource } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Document, DocumentType } from './entities/document.entity'; // Import 필요

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async createPortfolioWithText(
    userId: string,
    title: string,
    content: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User not found: userId=${userId}`);
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    // [수정 1] transaction 실행 결과를 변수(savedDocument)로 받음 + await 필수
    const savedDocument = await this.dataSource.transaction(async (manager) => {
      const portfolio = new Portfolio();
      portfolio.content = content;

      const document = new Document();
      document.title = title;
      document.type = DocumentType.PORTFOLIO;
      document.user = user;
      document.portfolio = portfolio;

      return await manager.save(Document, document);
    });

    return {
      documentId: savedDocument.documentId,
      type: savedDocument.type,
      portfolioId: savedDocument.portfolio.portfolioId,
      title: savedDocument.title,
      content: savedDocument.portfolio.content,
      createdAt: savedDocument.createdAt,
    };
  }

  async viewPortfolio(userId: string, documentId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User not found: userId=${userId}`);
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    const document = await this.documentRepository.findOneWithPortfolioById(
      userId,
      documentId,
    );

    if (!document) {
      this.logger.warn(
        `등록되지 않은 포트폴리오입니다. documentId=${documentId}`,
      );
      throw new NotFoundException('등록되지 않은 문서입니다');
    }

    return {
      documentId: document.documentId,
      type: document.type,
      portfolioId: document.portfolio.portfolioId,
      title: document.title,
      content: document.portfolio.content,
      createdAt: document.createdAt,
    };
  }
}
