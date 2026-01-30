import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';

import { DocumentService } from '../../../src/document/document.service';
import { UserService } from '../../../src/user/user.service';
import { DocumentRepository } from '../../../src/document/repositories/document.repository';
import { DocumentType } from '../../../src/document/entities/document.entity';
import { SortType } from '../../../src/document/dto/document-summary.request.dto';

describe('DocumentService', () => {
  let service: DocumentService;

  const mockUserService = {
    findExistingUser: jest.fn(),
  };

  const mockDocumentRepository = {
    // portfolio
    findOneWithPortfolioByDocumentIdAndUserId: jest.fn(),
    // cover letter
    findOneWithCoverLetterByDocumentIdAndUserId: jest.fn(),

    // CRUD
    remove: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),

    // list / bulk
    findDocumentsPage: jest.fn(),
    findAllByDocumentIds: jest.fn(),
    find: jest.fn(), // bulkDeleteDocuments의 remaining 조회에 필요
  };

  // TypeORM Transaction Mock
  const mockEntityManager = {
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb: (manager: any) => Promise<any>) =>
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
    jest.clearAllMocks();
  });

  it('DocumentService가 DI로 생성되면 서비스 인스턴스가 정상적으로 정의되어야 한다', () => {
    // Given: TestingModule로 서비스 생성
    // When: service 접근
    // Then: 정의되어 있어야 함
    expect(service).toBeDefined();
  });

  describe('createPortfolioWithText', () => {
    it('유효한 제목/내용으로 포트폴리오 생성을 요청하면 documentId와 content가 포함된 결과가 반환되어야 한다', async () => {
      // Given: 유저 존재 + 트랜잭션 save 성공
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const savedDocument = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'Title',
        createdAt: new Date(),
        portfolio: { portfolioId: 'port_1', content: 'Content' },
      };
      mockEntityManager.save.mockResolvedValue(savedDocument);

      // When
      const result = await service.createPortfolioWithText(
        '1',
        'Title',
        'Content',
      );

      // Then
      expect(result.documentId).toBe('doc_1');
      expect(result.content).toBe('Content');
      expect(mockUserService.findExistingUser).toHaveBeenCalledWith('1');
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('포트폴리오 생성 요청에서 제목이 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given / When / Then
      await expect(
        service.createPortfolioWithText('1', '   ', 'Content'),
      ).rejects.toThrow(BadRequestException);
    });

    it('포트폴리오 생성 요청에서 내용이 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given / When / Then
      await expect(
        service.createPortfolioWithText('1', 'Title', '   '),
      ).rejects.toThrow(BadRequestException);
    });

    it('포트폴리오 생성 요청에서 트랜잭션 저장이 실패하면 예외가 전파되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockEntityManager.save.mockRejectedValue(new Error('db error'));

      // When / Then
      await expect(
        service.createPortfolioWithText('1', 'Title', 'Content'),
      ).rejects.toThrow('db error');
    });
  });

  describe('viewPortfolio', () => {
    it('존재하는 포트폴리오 문서를 조회하면 title/content가 포함된 상세 정보가 반환되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const document = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'Title',
        portfolio: { portfolioId: 'port_1', content: 'Content' },
        createdAt: new Date(),
        modifiedAt: new Date(),
      };
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        document,
      );

      // When
      const result = await service.viewPortfolio('1', 'doc_1');

      // Then
      expect(result.title).toBe('Title');
      expect(result.content).toBe('Content');

      expect(mockUserService.findExistingUser).toHaveBeenCalledWith('1');
      expect(
        mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId,
      ).toHaveBeenCalledWith('1', 'doc_1');
    });

    it('포트폴리오 조회 요청에서 문서가 존재하지 않으면 NotFoundException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        null,
      );

      // When / Then
      await expect(service.viewPortfolio('1', 'doc_404')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePortfolio', () => {
    it('포트폴리오 수정 요청에서 title만 전달하면 title만 변경되어 저장되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const document = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'OldTitle',
        portfolio: { portfolioId: 'port_1', content: 'OldContent' },
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        document,
      );

      mockDocumentRepository.save.mockResolvedValue({
        ...document,
        title: 'NewTitle',
      });

      // When
      const result = await service.updatePortfolio(
        '1',
        'doc_1',
        'NewTitle',
        undefined,
      );

      // Then
      expect(mockDocumentRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('NewTitle');
      expect(result.content).toBe('OldContent');
    });

    it('포트폴리오 수정 요청에서 content만 전달하면 content만 변경되어 저장되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const document = {
        documentId: 'doc_1',
        type: DocumentType.PORTFOLIO,
        title: 'OldTitle',
        portfolio: { portfolioId: 'port_1', content: 'OldContent' },
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        document,
      );

      mockDocumentRepository.save.mockResolvedValue({
        ...document,
        portfolio: { ...document.portfolio, content: 'NewContent' },
      });

      // When
      const result = await service.updatePortfolio(
        '1',
        'doc_1',
        undefined,
        'NewContent',
      );

      // Then
      expect(mockDocumentRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('OldTitle');
      expect(result.content).toBe('NewContent');
    });

    it('포트폴리오 수정 요청에서 문서가 없으면 NotFoundException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        null,
      );

      // When / Then
      await expect(
        service.updatePortfolio('1', 'doc_404', 'New', 'NewContent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('포트폴리오 수정 요청에서 title이 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          title: 'OldTitle',
          portfolio: { portfolioId: 'port_1', content: 'OldContent' },
        },
      );

      // When / Then
      await expect(
        service.updatePortfolio('1', 'doc_1', '   ', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('포트폴리오 수정 요청에서 content가 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithPortfolioByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          title: 'OldTitle',
          portfolio: { portfolioId: 'port_1', content: 'OldContent' },
        },
      );

      // When / Then
      await expect(
        service.updatePortfolio('1', 'doc_1', undefined, '   '),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createCoverLetter', () => {
    it('유효한 제목과 QnA 목록으로 자소서 생성을 요청하면 documentId/content가 반환되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const items = [{ question: 'Q1', answer: 'A1' }];

      const savedDocument = {
        documentId: 'doc_2',
        type: DocumentType.COVER,
        title: 'Cover',
        createdAt: new Date(),
        coverLetter: {
          coverLetterId: 'cl_1',
          questionAnswers: items.map((x) => ({ ...x })),
        },
      };

      // createCoverLetter 내부에서 save 3번 호출(Document, CoverLetter, QAs)
      mockEntityManager.save
        .mockResolvedValueOnce({ ...savedDocument }) // Document
        .mockResolvedValueOnce({ ...savedDocument.coverLetter }) // CoverLetter
        .mockResolvedValueOnce(
          items.map((x) => ({ ...x, coverLetter: { coverLetterId: 'cl_1' } })),
        ); // QAs

      // When
      const result = await service.createCoverLetter('1', 'Cover', items);

      // Then
      expect(result.documentId).toBe('doc_2');
      expect(result.title).toBe('Cover');
      expect(result.content).toEqual([{ question: 'Q1', answer: 'A1' }]);
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledTimes(3);
    });

    it('자소서 생성 요청에서 title이 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      // When / Then
      await expect(
        service.createCoverLetter('1', '   ', [{ question: 'Q', answer: 'A' }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('자소서 생성 요청에서 QnA 중 question/answer가 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      // When / Then
      await expect(
        service.createCoverLetter('1', 'Title', [
          { question: '   ', answer: 'A' },
        ]),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createCoverLetter('1', 'Title', [
          { question: 'Q', answer: '   ' },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('viewCoverLetter', () => {
    it('자소서 조회 요청에서 문서가 없으면 NotFoundException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        null,
      );

      // When / Then
      await expect(service.viewCoverLetter('1', 'doc_404')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('자소서 조회 요청에서 coverLetter 데이터가 누락되면 InternalServerErrorException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          type: DocumentType.COVER,
          title: 'Title',
          coverLetter: null,
        },
      );

      // When / Then
      await expect(service.viewCoverLetter('1', 'doc_1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateCoverLetter', () => {
    it('자소서 수정 요청에서 content만 변경하면 modifiedAt이 수동 갱신되어 저장되어야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      const document = {
        documentId: 'doc_1',
        type: DocumentType.COVER,
        title: 'OldTitle',
        createdAt: new Date(),
        modifiedAt: new Date('2020-01-01'),
        coverLetter: {
          coverLetterId: 'cl_1',
          questionAnswers: [{ question: 'Q1', answer: 'A1' }],
        },
      };

      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        document,
      );

      const updated = {
        ...document,
        // service 내부에서 document.modifiedAt을 new Date()로 바꿀 수 있으므로
        // save 결과도 최신 modifiedAt을 가진 것으로 가정
        modifiedAt: new Date(),
        coverLetter: {
          ...document.coverLetter,
          questionAnswers: [{ question: 'Q2', answer: 'A2' }],
        },
      };

      mockEntityManager.save.mockResolvedValue(updated);

      // When
      const result = await service.updateCoverLetter('1', 'doc_1', {
        content: [{ question: 'Q2', answer: 'A2' }],
      });

      // Then
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result.content).toEqual([{ question: 'Q2', answer: 'A2' }]);
      expect(result.modifiedAt).toBeDefined();
    });

    it('자소서 수정 요청에서 title이 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      // findExistingCoverLetter까지 가지 않더라도 title validation에서 터질 수 있음
      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          type: DocumentType.COVER,
          title: 'OldTitle',
          coverLetter: { coverLetterId: 'cl_1', questionAnswers: [] },
        },
      );

      // When / Then
      await expect(
        service.updateCoverLetter('1', 'doc_1', { title: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('자소서 수정 요청에서 QnA 중 question/answer가 공백이면 BadRequestException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          type: DocumentType.COVER,
          title: 'OldTitle',
          coverLetter: { coverLetterId: 'cl_1', questionAnswers: [] },
        },
      );

      // When / Then
      await expect(
        service.updateCoverLetter('1', 'doc_1', {
          content: [{ question: '   ', answer: 'A' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('자소서 수정 트랜잭션에서 저장 결과가 없으면 InternalServerErrorException이 발생해야 한다', async () => {
      // Given
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      mockDocumentRepository.findOneWithCoverLetterByDocumentIdAndUserId.mockResolvedValue(
        {
          documentId: 'doc_1',
          type: DocumentType.COVER,
          title: 'OldTitle',
          coverLetter: { coverLetterId: 'cl_1', questionAnswers: [] },
        },
      );

      mockEntityManager.save.mockResolvedValue(null);

      // When / Then
      await expect(
        service.updateCoverLetter('1', 'doc_1', { title: 'NewTitle' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('listDocuments', () => {
    it('문서 목록 조회에서 page=1이면 repository에는 adjustedPage=0으로 전달되어야 한다', async () => {
      // Given
      const docs = [
        {
          documentId: 'd1',
          title: 't1',
          type: DocumentType.COVER,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      ];
      mockDocumentRepository.findDocumentsPage.mockResolvedValue([docs, 1]);

      // When
      const result = await service.listDocuments(
        'u1',
        1,
        10,
        undefined,
        SortType.DESC,
      );

      // Then
      expect(mockDocumentRepository.findDocumentsPage).toHaveBeenCalledWith(
        'u1',
        0,
        10,
        undefined,
        SortType.DESC,
      );
      expect(result.totalPage).toBe(1);
      expect(result.documents).toHaveLength(1);
    });

    it('문서 목록 조회에서 page가 0 이하이면 adjustedPage는 0으로 보정되어야 한다', async () => {
      // Given
      mockDocumentRepository.findDocumentsPage.mockResolvedValue([[], 0]);

      // When
      await service.listDocuments('u1', 0, 10, undefined, SortType.ASC);

      // Then
      expect(mockDocumentRepository.findDocumentsPage).toHaveBeenCalledWith(
        'u1',
        0,
        10,
        undefined,
        SortType.ASC,
      );
    });
  });

  describe('bulkDeleteDocuments (updated)', () => {
    it('일괄 삭제 요청에서 일부 documentId가 누락되면 BadRequestException이 발생해야 한다', async () => {
      // Given: 요청 2개 중 1개만 DB에서 조회됨
      mockDocumentRepository.findAllByDocumentIds.mockResolvedValue([
        { documentId: '1' },
      ]);

      // When / Then
      await expect(
        service.bulkDeleteDocuments('user_1', ['1', '2']),
      ).rejects.toThrow(BadRequestException);

      expect(mockDocumentRepository.delete).not.toHaveBeenCalled();
    });

    it('일괄 삭제 요청에서 모두 존재하고 delete가 전부 성공하면 success=true, failedDocuments=[]가 반환되어야 한다', async () => {
      // Given
      mockDocumentRepository.findAllByDocumentIds.mockResolvedValue([
        { documentId: '1' },
        { documentId: '2' },
      ]);

      mockDocumentRepository.delete.mockResolvedValue({ affected: 2 });

      // When
      const result = await service.bulkDeleteDocuments('user_1', ['1', '2']);

      // Then
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith({
        documentId: In(['1', '2']),
      });

      expect(result).toEqual({
        success: true,
        requestedCount: 2,
        deletedCount: 2,
        failedDocuments: [],
      });

      expect(mockDocumentRepository.find).not.toHaveBeenCalled();
    });

    it('일괄 삭제 요청에서 delete가 일부만 성공하면 remaining 조회 후 failedDocuments가 반환되어야 한다', async () => {
      // Given: 두 개 모두 존재
      mockDocumentRepository.findAllByDocumentIds.mockResolvedValue([
        { documentId: '1' },
        { documentId: '2' },
      ]);

      // delete는 1개만 성공
      mockDocumentRepository.delete.mockResolvedValue({ affected: 1 });

      // remaining 조회 결과(남아있는 문서)
      mockDocumentRepository.find.mockResolvedValue([{ documentId: '2' }]);

      // When
      const result = await service.bulkDeleteDocuments('user_1', ['1', '2']);

      // Then: delete 조건 검증 (정확히 In(foundIds))
      expect(mockDocumentRepository.delete).toHaveBeenCalledWith({
        documentId: In(['1', '2']),
      });

      // Then: remaining 조회 조건 검증 (정확히 In(foundIds))
      expect(mockDocumentRepository.find).toHaveBeenCalledWith({
        select: { documentId: true },
        where: { user: { userId: 'user_1' }, documentId: In(['1', '2']) },
      });

      expect(result).toEqual({
        success: false,
        requestedCount: 2,
        deletedCount: 1,
        failedDocuments: ['2'],
      });
    });
  });
});
