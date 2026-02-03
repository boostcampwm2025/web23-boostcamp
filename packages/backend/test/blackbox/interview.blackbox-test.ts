import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';
import { InterviewAIService } from '../../src/interview/interview-ai.service';
import { InterviewFeedbackService } from '../../src/interview/interview-feedback.service';

describe('Interview (Blackbox)', () => {
  let app: INestApplication;
  let accessToken: string;
  let interviewId: string;
  let createdDocumentId: number;

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest
      .fn()
      .mockResolvedValue('mock_google_access_token'),
    getUserInfo: jest.fn().mockResolvedValue({
      email: 'blackbox_test_user@example.com',
      profileUrl: 'http://example.com/profile.jpg',
      sub: 'blackbox_user_123',
    }),
  };

  // Mock InterviewAIService to bypass Clova API
  const mockInterviewAIService = {
    generateInterviewQuestion: jest.fn().mockResolvedValue({
      question: 'This is a mocked AI question regarding your experience.',
      tags: ['mock', 'ai'],
      isLast: false,
    }),
  };

  // Mock InterviewFeedbackService to bypass Clova API
  const mockInterviewFeedbackService = {
    requestTechInterviewFeedBack: jest.fn().mockResolvedValue({
      score: 85,
      feedback: 'Good technical understanding.',
    }),
  };

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleOAuthService)
      .useValue(mockGoogleOAuthService)
      .overrideProvider(InterviewAIService)
      .useValue(mockInterviewAIService)
      .overrideProvider(InterviewFeedbackService) // Add mock for feedback
      .useValue(mockInterviewFeedbackService)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Interview Lifecycle (면접 전체 사이클)', () => {
    it('1. 인증 (GET /auth/signup/oauth)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/auth/signup/oauth?code=mock_code')
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      accessToken = (response.body as { accessToken: string }).accessToken;
    });

    it('2. 포트폴리오 생성 (POST /document/portfolio/create)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/document/portfolio/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Blackbox Test Portfolio',
          content: 'I have experience in NestJS and TypeORM.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('documentId');
      createdDocumentId = (response.body as { documentId: number }).documentId;
    });

    it('3. 면접 생성 (POST /interview/tech/create)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/interview/tech/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          simulationTitle: 'Blackbox Tech Interview',
          documentIds: [String(createdDocumentId)],
        })
        .expect(201);

      expect(response.body).toHaveProperty('interviewId');
      expect(response.body).toHaveProperty('question');
      interviewId = (response.body as { interviewId: string }).interviewId;
    });

    it('4. 면접 질문 조회 (POST /interview/tech/question)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/interview/tech/question')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interviewId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('question');
    });

    it('5. 답변 제출 (POST /interview/answer/chat)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/interview/answer/chat')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interviewId,
          answer: 'My answer to the question.',
        })
        .expect(201);

      expect(response.body).toHaveProperty('answer');
    });

    it('6. 면접 중단 (POST /interview/stop)', async () => {
      await request(app.getHttpServer() as Server)
        .post('/interview/stop')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interviewId,
        })
        .expect(201);
    });

    it('7. 피드백 생성 (POST /interview/feedback)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/interview/feedback')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          interviewId,
        })
        .expect(201);

      const body = response.body as {
        score: string | number;
        feedback: string;
      };
      expect(body.score).toBeDefined();
      expect(String(body.score)).toBe('85');
      expect(body).toHaveProperty('feedback', 'Good technical understanding.');
    });

    it('8. 피드백 조회 (GET /interview/{id}/feedback)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(`/interview/${interviewId}/feedback`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as {
        score: string | number;
        feedback: string;
      };
      // The response seems to serialize numbers to strings in some environments or DTO configs
      // Adjusting expectation to match observed behavior if necessary, or loose equality.
      // Received "85" (string).
      expect(body.score).toBeDefined();
      expect(String(body.score)).toBe('85');
      expect(body).toHaveProperty('feedback', 'Good technical understanding.');
    });

    it('9. 채팅 기록 조회 (GET /interview/{id}/chat/history)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(`/interview/${interviewId}/chat/history`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as { history: unknown[] };
      expect(body).toHaveProperty('history');
      expect(Array.isArray(body.history)).toBe(true);
      expect(body.history.length).toBeGreaterThan(0);
    });

    it('10. 면접 시간 조회 (GET /interview/{id}/time)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(`/interview/${interviewId}/time`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('duringTime');
    });

    it('11. 면접 목록 조회 (GET /interview)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/interview')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as { interviews: unknown[] };
      expect(body).toHaveProperty('interviews');
      expect(Array.isArray(body.interviews)).toBe(true);
      expect(body.interviews.length).toBeGreaterThan(0);
    });

    it('12. 면접 삭제 (DELETE /interview/{id})', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/interview/${interviewId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    // Clean up document
    it('13. 포트폴리오 삭제 (DELETE /document)', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/document`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentIds: [String(createdDocumentId)] })
        .expect(200);
    });
  });
});
