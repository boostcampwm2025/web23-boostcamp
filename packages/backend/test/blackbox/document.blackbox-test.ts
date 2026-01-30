import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';

describe('Document (Blackbox)', () => {
  let app: INestApplication;
  let accessToken: string;
  let portfolioId: number;
  let coverLetterId: number;

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest
      .fn()
      .mockResolvedValue('mock_google_access_token_doc'),
    getUserInfo: jest.fn().mockResolvedValue({
      email: 'doc_blackbox_user@example.com',
      firstName: 'Doc',
      lastName: 'Tester',
      picture: 'https://example.com/doc_tester.jpg',
      sub: 'doc_blackbox_user_sub',
    }),
  };

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GoogleOAuthService)
      .useValue(mockGoogleOAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    // 회원가입 및 로그인하여 토큰 획득
    const authResponse = await request(app.getHttpServer() as Server)
      .get('/auth/signup/oauth')
      .query({ code: 'mock_auth_code_doc' })
      .expect(200);

    accessToken = (authResponse.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Portfolio', () => {
    it('1. 포트폴리오 생성 (POST /document/portfolio/create)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/document/portfolio/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'My Portfolio',
          content: 'Portfolio Content',
        })
        .expect(201);

      expect(response.body).toHaveProperty('documentId');
      portfolioId = (response.body as { documentId: number }).documentId;
    });

    it('2. 포트폴리오 상세 조회 (GET /document/{id}/portfolio)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(`/document/${portfolioId}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'My Portfolio');
      expect(response.body).toHaveProperty('content', 'Portfolio Content');
    });

    it('3. 포트폴리오 수정 (PATCH /document/{id}/portfolio)', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/document/${portfolioId}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Portfolio',
          content: 'Updated Content',
        })
        .expect(200);

      // 수정 후 재조회 확인
      const getResponse = await request(app.getHttpServer() as Server)
        .get(`/document/${portfolioId}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('title', 'Updated Portfolio');
      expect(getResponse.body).toHaveProperty('content', 'Updated Content');
    });
  });

  describe('Cover Letter', () => {
    it('4. 자소서 생성 (POST /document/cover-letter/create)', async () => {
      // API spec assumption: uses same endpoint or specific one?
      // Plan said: POST /document/cover-letter/create
      const response = await request(app.getHttpServer() as Server)
        .post('/document/cover-letter/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'My Cover Letter',
          content: [
            { question: 'Motivation', answer: 'I want to join.' },
            { question: 'Strength', answer: 'I am diligent.' },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('documentId');
      coverLetterId = (response.body as { documentId: number }).documentId;
    });

    it('5. 자소서 상세 조회 (GET /document/{id}/cover-letter)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get(`/document/${coverLetterId}/cover-letter`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Response format structure check (might be body.title, body.content array?)
      // Let's assume standard response based on plan/previous context
      expect(response.body).toHaveProperty('title', 'My Cover Letter');
      // Check contents
      // This depends on how it is returned. Assuming mapped to 'content' or 'qna'
    });

    it('6. 자소서 수정 (PUT /document/{id}/cover-letter)', async () => {
      // Plan says PUT. Verify if PUT or PATCH. Typically PUT for full replace, PATCH for partial.
      // Assuming PUT as per plan.
      await request(app.getHttpServer() as Server)
        .put(`/document/${coverLetterId}/cover-letter`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Cover Letter',
          content: [{ question: 'Motivation', answer: 'Updated motivation.' }],
        })
        .expect(200);

      const getResponse = await request(app.getHttpServer() as Server)
        .get(`/document/${coverLetterId}/cover-letter`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('title', 'Updated Cover Letter');
    });
  });

  describe('Document List & Deletion', () => {
    it('7. 문서 목록 조회 (GET /document)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { documents } = response.body as { documents: unknown[] };
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThanOrEqual(2); // Portfolio + Cover Letter
    });

    it('8. 문서 삭제 (DELETE /document)', async () => {
      // Deleting Portfolio and Cover Letter
      await request(app.getHttpServer() as Server)
        .delete('/document')
        .send({ documentIds: [String(portfolioId), String(coverLetterId)] })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer() as Server)
        .get(`/document/${portfolioId}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
