import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from '../../../src/document/document.service';
import { UserService } from '../../../src/user/user.service';
import { DocumentRepository } from '../../../src/document/repositories/document.repository';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '../../../src/document/entities/document.entity';

describe('DocumentService', () => {
  let service: DocumentService;
  // Unused variables removed

  const mockUserService = {
    findExistingUser: jest.fn(),
  };

  const mockDocumentRepository = {
    findOneWithPortfolioByDocumentIdAndUserId: jest.fn(),
    findOneWithCoverLetterByDocumentIdAndUserId: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    findAllByDocumentIds: jest.fn(),
    delete: jest.fn(),
  };

  // TypeORM Transaction Mock
  const mockEntityManager = {
    save: jest.fn(),
  };
  const mockDataSource = {
    transaction: jest.fn((cb: (manager: unknown) => Promise<unknown>) =>
      cb(mockEntityManager),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: UserService, useValue: mockUserService },
        { provide: DocumentRepository, useValue: mockDocumentRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    // dataSource = module.get<DataSource>(DataSource);
    // documentRepository = module.get<DocumentRepository>(DocumentRepository);
    // userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPortfolioWithText', () => {
    it('성공: 포트폴리오 생성', async () => {
      const mockUser = { userId: '1' };
      mockUserService.findExistingUser.mockResolvedValue(mockUser);

      const savedDoc = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'Title',
        createdAt: new Date(),
        portfolio: { portfolioId: 'port_1', content: 'Content' },
      };
      // Transaction inside returns savedDoc
      mockEntityManager.save.mockResolvedValue(savedDoc);

      const result = await service.createPortfolioWithText(
        '1',
        'Title',
        'Content',
      );

      expect(result.documentId).toBe('doc_1');
      expect(result.content).toBe('Content');
    });

    it('실패: 제목이 비어있음', async () => {
      await expect(
        service.createPortfolioWithText('1', '', 'Content'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('viewPortfolio', () => {
    it('성공: 포트폴리오 조회', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      const mockDoc = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'Title',
        portfolio: { portfolioId: 'port_1', content: 'Content' },
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        mockDoc,
      );

      const result = await service.viewPortfolio('1', 'doc_1');
      expect(result.title).toBe('Title');
    });

    it('실패: 문서 없음', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        null,
      );

      await expect(service.viewPortfolio('1', 'doc_999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCoverLetter', () => {
    it('성공: 자소서 생성', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      const items = [{ question: 'Q', answer: 'A' }];

      // Transaction structure logic
      const savedDoc = {
        documentId: 'doc_2',
        type: DocumentType.COVER,
        title: 'Cover',
        createdAt: new Date(),
        coverLetter: {
          coverLetterId: 'cl_1',
          questionAnswers: items,
        },
      };
      // We are mocking manager.save implicitly by the return of transaction callback
      // But the service calls manager.save multiple times.
      // Simplified mock: last return of transaction block is what matters for service return.
      // But we need to ensure mocked save returns objects that don't crash the logic.

      mockEntityManager.save
        .mockResolvedValueOnce({ ...savedDoc }) // Document
        .mockResolvedValueOnce({ ...savedDoc.coverLetter }) // CoverLetter
        .mockResolvedValueOnce(items); // QnA

      const result = await service.createCoverLetter('1', 'Cover', items);

      expect(result.documentId).toBe('doc_2');
      expect(result.content).toHaveLength(1);
    });

    it('실패: 질문/답변 빈값', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      const items = [{ question: '', answer: 'A' }];

      await expect(
        service.createCoverLetter('1', 'Title', items),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkDeleteDocuments', () => {
    it('성공: 문서 일괄 삭제', async () => {
      const ids = ['1', '2'];
      const docs = [{ documentId: '1' }, { documentId: '2' }];
      mockDocumentRepository.findAllByDocumentIds.mockResolvedValue(docs);

      const result = await service.bulkDeleteDocuments('user_1', ids);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
      expect(mockDocumentRepository.delete).toHaveBeenCalled();
    });
  });
});
