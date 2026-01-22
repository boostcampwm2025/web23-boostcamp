import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DocumentRepository } from './repositories/document.repository';
import { DataSource } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { Document, DocumentType } from './entities/document.entity';
import { UserService } from '../user/user.service';
import { DocumentSummaryListResponse } from './dto/document-summary.response.dto';
import { SortType } from './dto/document-summary.request.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async createPortfolioWithText(
    userId: string,
    title: string,
    content: string,
  ) {
    const user = await this.userService.findExistingUser(userId);

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
    const user = await this.userService.findExistingUser(userId);

    const document = await this.documentRepository.findOneWithPortfolioById(
      user.userId,
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

  async listDocuments(
    userId: string,
    page: number,
    take: number,
    type: DocumentType | undefined,
    sort: SortType,
  ): Promise<DocumentSummaryListResponse> {
    // 프론트의 페이지 시작은 1이지만 백엔드에선 0부터이다. 이를 맞추기 위해 값을 1 빼서 조정한다.
    const adjustedPage = Math.max(0, page - 1);
    const [documents, count] = await this.documentRepository.findDocumentsPage(
      userId,
      adjustedPage,
      take,
      type,
      sort,
    );

    // 전체 페이지네이션 계산을 위해 올림을 사용
    const totalPage = Math.ceil(count / take);

    const documentList = documents.map((doc) => {
      return {
        documentId: doc.documentId,
        title: doc.title,
        type: doc.type,
        createdAt: doc.createdAt,
        modifiedAt: doc.modifiedAt,
      };
    });

    return {
      documents: documentList,
      totalPage: totalPage,
    };
  }

  async deletePortfolio(userId: string, documentId: string) {
    const user = await this.userService.findExistingUser(userId);
      const document = await this.documentRepository.findOneWithPortfolioById(
        user.userId,
        documentId,
      );

      if (!document) {
        this.logger.warn(`등록되지 않은 문서입니다. documentId=${documentId}`);
        throw new NotFoundException('문서를 찾을 수 없습니다.');
      }

      const deletedDocument = await this.documentRepository.remove(document);
      if (!deletedDocument) {
        this.logger.warn(`문서 삭제에 실패했습니다. documentId=${documentId}`);
        throw new InternalServerErrorException('문서 삭제에 실패했습니다.');
      }
  }
}
