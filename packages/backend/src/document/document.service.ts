import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { UserRepository } from '../user/user.repository';
import { PortfolioRepository } from './repositories/portfolio.repository';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly portfolioRepository: PortfolioRepository,
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

    const document = await this.documentRepository.createPortfolioDocument(
      title,
      userId,
      content,
    );

    return {
      documentId: document.documentId,
      type: document.type,
      portfolioId: document.portfolio.portfolioId,
      title: document.title,
      content: document.portfolio.content,
      createdAt: document.createdAt,
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
