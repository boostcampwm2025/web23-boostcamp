import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly userRepository: UserRepository,
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
}
