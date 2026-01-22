import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { DocumentRepository } from './repositories/document.repository';
import { UserRepository } from '../user/user.repository';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class DocumentService {
  constructor(
    readonly userRepository: UserRepository,
    readonly documentRepository: DocumentRepository,
    readonly portfolioRepository: PortfolioRepository,
  ) {}

  async createPortfolioWithText(
    userId: string,
    title: string,
    content: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('등록되지 않은 유저입니다.');
    }

    const document = await this.documentRepository.createPortfolioDocument(
      title,
      userId,
    );

    const portfolio: Portfolio = await this.portfolioRepository.save({
      content,
      document: { documentId: document.documentId },
    });

    return {
      documentId: document.documentId,
      type: document.type,
      portfolioId: portfolio.portfolioId,
      title: document.title,
      content: portfolio.content,
      createdAt: document.createdAt,
    };
  }
}
