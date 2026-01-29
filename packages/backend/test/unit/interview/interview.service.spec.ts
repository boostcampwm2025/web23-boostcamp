import { Test, TestingModule } from '@nestjs/testing';
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
import { BadRequestException } from '@nestjs/common';

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
  });

  describe('createTechInterview', () => {
    it('성공: 인터뷰 생성', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      // 문서 1개 요청 -> 1개 발견
      const docs = [{ documentId: 'doc1', type: 'PORTFOLIO' }];
      mockDocumentRepository.find.mockResolvedValue(docs);

      // Simulate TypeORM behavior: save() mutates the entity with generated ID
      mockInterviewRepository.save.mockImplementation(
        async (interview: Interview) => {
          interview.interviewId = 'iv_1';
          return Promise.resolve(interview);
        },
      );

      mockQuestionRepository.createQuestion.mockResolvedValue({
        questionId: 'q_1',
        createdAt: new Date(),
      });
      mockInterviewAIService.generateInterviewQuestion.mockResolvedValue({
        question: 'Hello?',
        isLast: false,
      });

      const result = await service.createTechInterview('1', {
        simulationTitle: 'Sim',
        documentIds: ['doc1'],
      });

      expect(mockInterviewRepository.save).toHaveBeenCalled();
      expect(mockKeySetStore.addToNumber).toHaveBeenCalledWith('iv_1', 1); // 1st turn
      expect(result.interviewId).toBe('iv_1');
    });

    it('실패: 요청 문서 불일치', async () => {
      mockUserService.findExistingUser.mockResolvedValue({ userId: '1' });
      mockDocumentRepository.find.mockResolvedValue([]); // 찾은 게 없음

      await expect(
        service.createTechInterview('1', {
          simulationTitle: 'Sim',
          documentIds: ['doc1'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('chatInterviewer', () => {
    it('성공: 다음 질문 생성', async () => {
      const mockUser = { userId: '1' };
      const mockInterview = {
        interviewId: 'iv_1',
        user: mockUser,
        createdAt: new Date(),
        validateUser: jest.fn(),
      };

      mockUserService.findExistingUser.mockResolvedValue(mockUser);
      mockInterviewRepository.findById.mockResolvedValue(mockInterview);
      mockKeySetStore.getNumber.mockReturnValue(1); // turn 1

      mockInterviewAIService.generateInterviewQuestion.mockResolvedValue({
        question: 'Next Question?',
        isLast: false,
      });
      mockQuestionRepository.createQuestion.mockResolvedValue({
        questionId: 'q_2',
        createdAt: new Date(),
      });

      const result = await service.chatInterviewer('1', 'iv_1');
      expect(result.question).toBe('Next Question?');
      expect(mockKeySetStore.addToNumber).toHaveBeenCalledWith('iv_1', 2);
    });
  });

  describe('createInterviewFeedback', () => {
    it('성공: 피드백 생성', async () => {
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
      mockInterviewFeedbackService.requestTechInterviewFeedBack.mockResolvedValue(
        {
          score: 90,
          feedback: 'Great',
        },
      );

      const result = await service.createInterviewFeedback('1', 'iv_1');

      expect(result.score).toBe(90);
      expect(mockInterviewRepository.save).toHaveBeenCalled();
    });
  });
});
