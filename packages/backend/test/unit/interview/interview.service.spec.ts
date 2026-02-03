import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { InterviewService } from '../../../src/interview/interview.service';
import { Interview } from '../../../src/interview/entities/interview.entity';
import { InterviewRepository } from '../../../src/interview/interview.repository';
import { SttService } from '../../../src/interview/stt.service';
import { QuestionsRepository } from '../../../src/interview/repositories/questions.repository';
import { AnswersRepository } from '../../../src/interview/repositories/answers.repository';
import { KeySetStore } from '../../../src/interview/stores/key-set.store';
import { InterviewAIService } from '../../../src/interview/interview-ai.service';
import { PortfolioRepository } from '../../../src/document/repositories/portfolio.repository';
import { CoverLetterRepository } from '../../../src/document/repositories/cover-letter.repository';
import { DocumentRepository } from '../../../src/document/repositories/document.repository';
import { InterviewFeedbackService } from '../../../src/interview/interview-feedback.service';
import { UserService } from '../../../src/user/user.service';

describe('InterviewService', () => {
  let service: InterviewService;

  const mockInterviewRepository = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  const mockSttService = {};

  const mockQuestionRepository = {
    createQuestion: jest.fn(),
    findFiveByInterviewId: jest.fn().mockResolvedValue([]),
  };

  const mockAnswerRepository = {
    findFiveByInterviewId: jest.fn().mockResolvedValue([]),
  };

  const mockKeySetStore = {
    addToSet: jest.fn(),
    addToNumber: jest.fn(),
    getSet: jest.fn().mockReturnValue([]),
    getNumber: jest.fn(),
  };

  const mockInterviewAIService = {
    generateInterviewQuestion: jest.fn(),
  };

  const mockPortfolioRepository = {};
  const mockCoverLetterRepository = {};

  const mockDocumentRepository = {
    find: jest.fn(),
  };

  const mockInterviewFeedbackService = {
    requestTechInterviewFeedBack: jest.fn(),
  };

  const mockUserService = {
    findExistingUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        { provide: InterviewRepository, useValue: mockInterviewRepository },
        { provide: SttService, useValue: mockSttService },
        { provide: QuestionsRepository, useValue: mockQuestionRepository },
        { provide: AnswersRepository, useValue: mockAnswerRepository },
        { provide: KeySetStore, useValue: mockKeySetStore },
        { provide: InterviewAIService, useValue: mockInterviewAIService },
        { provide: PortfolioRepository, useValue: mockPortfolioRepository },
        { provide: CoverLetterRepository, useValue: mockCoverLetterRepository },
        { provide: DocumentRepository, useValue: mockDocumentRepository },
        {
          provide: InterviewFeedbackService,
          useValue: mockInterviewFeedbackService,
        },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    jest.clearAllMocks();
  });

  describe('createTechInterview', () => {
    it('유저가 유효한 문서 ID들로 기술면접 생성을 요청하면 인터뷰가 생성되고 첫 질문이 반환되어야 한다', async () => {
      // Given: 유저가 존재함
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      // Given: 요청 문서 1개를 전달했고, 조회 결과도 1개가 존재함
      const docs = [{ documentId: 'doc1', type: 'PORTFOLIO' }];
      mockDocumentRepository.find.mockResolvedValue(docs);

      // Given: 저장 시 interviewId가 채워진다고 가정(TypeORM save 시나리오)
      mockInterviewRepository.save.mockImplementation(
        (interview: Interview) => {
          interview.interviewId = 'iv_1';
          return interview;
        },
      );

      // Given: 질문 생성 관련 의존성
      mockInterviewAIService.generateInterviewQuestion.mockResolvedValue({
        question: 'Hello?',
        isLast: false,
      });
      mockQuestionRepository.createQuestion.mockResolvedValue({
        questionId: 'q_1',
        createdAt: new Date(),
      });

      // When: 기술면접 생성
      const result = await service.createTechInterview('1', {
        simulationTitle: 'Sim',
        documentIds: ['doc1'],
      });

      // Then: 인터뷰 저장 및 turn(질문 횟수) 초기화가 수행되어야 한다
      expect(mockInterviewRepository.save).toHaveBeenCalled();
      expect(mockKeySetStore.addToNumber).toHaveBeenCalledWith('iv_1', 1);

      // Then: 첫 질문 생성이 호출되어야 한다
      expect(
        mockInterviewAIService.generateInterviewQuestion,
      ).toHaveBeenCalled();
      expect(mockQuestionRepository.createQuestion).toHaveBeenCalled();

      // Then: 결과에 interviewId가 포함되어야 한다
      expect(result.interviewId).toBe('iv_1');
    });

    it('유저가 요청한 문서 ID를 전부 찾지 못하면 BadRequestException이 발생해야 한다', async () => {
      // Given: 유저가 존재함
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });

      // Given: 요청 문서를 찾지 못함
      mockDocumentRepository.find.mockResolvedValue([]);

      // When / Then: 기술면접 생성 요청 시 BadRequestException
      await expect(
        service.createTechInterview('1', {
          simulationTitle: 'Sim',
          documentIds: ['doc1'],
        }),
      ).rejects.toThrow(BadRequestException);

      // Then: 인터뷰 저장은 시도되지 않아야 한다
      expect(mockInterviewRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('chatInterviewer', () => {
    it('유저가 본인 인터뷰에서 다음 질문 생성을 요청하면 턴이 증가하고 다음 질문이 반환되어야 한다', async () => {
      // Given: 유저 존재
      const mockUser = { userId: '1' };
      mockUserService.findExistingUser.mockResolvedValue(mockUser);

      // Given: 인터뷰 존재 + 소유자 검증 메서드 존재
      const mockInterview = {
        interviewId: 'iv_1',
        user: mockUser,
        createdAt: new Date(),
        validateUser: jest.fn(),
      };
      mockInterviewRepository.findById.mockResolvedValue(mockInterview);

      // Given: 현재 turn=1
      mockKeySetStore.getNumber.mockReturnValue(1);

      // Given: AI가 다음 질문을 반환
      mockInterviewAIService.generateInterviewQuestion.mockResolvedValue({
        question: 'Next Question?',
        isLast: false,
      });

      // Given: 질문 저장 성공
      mockQuestionRepository.createQuestion.mockResolvedValue({
        questionId: 'q_2',
        createdAt: new Date(),
      });

      // When: 다음 질문 생성
      const result = await service.chatInterviewer('1', 'iv_1');

      // Then: 인터뷰 소유자 검증이 수행되어야 한다
      expect(mockInterview.validateUser).toHaveBeenCalledWith('1');

      // Then: turn이 2로 증가해야 한다
      expect(mockKeySetStore.addToNumber).toHaveBeenCalledWith('iv_1', 2);

      // Then: 결과 질문이 반환되어야 한다
      expect(result.question).toBe('Next Question?');

      // Then: 질문 생성/저장이 수행되어야 한다
      expect(
        mockInterviewAIService.generateInterviewQuestion,
      ).toHaveBeenCalled();
      expect(mockQuestionRepository.createQuestion).toHaveBeenCalled();
    });
  });

  describe('createInterviewFeedback', () => {
    it('유저가 본인 인터뷰에 대해 피드백 생성을 요청하면 AI 피드백이 저장되고 score/feedback이 반환되어야 한다', async () => {
      // Given: 인터뷰 존재 + 소유자 검증 가능 + 초기 피드백 없음
      const mockInterview = {
        interviewId: 'iv_1',
        user: { userId: '1' },
        questions: [],
        answers: [],
        validateUser: jest.fn(),
        score: null,
        feedback: null,
      };
      mockInterviewRepository.findById.mockResolvedValue(mockInterview);

      // Given: AI 피드백 응답
      mockInterviewFeedbackService.requestTechInterviewFeedBack.mockResolvedValue(
        {
          score: 90,
          feedback: 'Great',
        },
      );

      // When: 피드백 생성
      const result = await service.createInterviewFeedback('1', 'iv_1');

      // Then: 인터뷰 소유자 검증이 수행되어야 한다
      expect(mockInterview.validateUser).toHaveBeenCalledWith('1');

      // Then: AI 피드백 요청이 수행되어야 한다
      expect(
        mockInterviewFeedbackService.requestTechInterviewFeedBack,
      ).toHaveBeenCalled();

      // Then: 저장(save)이 수행되어야 한다
      expect(mockInterviewRepository.save).toHaveBeenCalled();

      // Then: 결과가 반환되어야 한다
      expect(result.score).toBe(90);
      expect(result.feedback).toBe('Great');
    });
  });
});
