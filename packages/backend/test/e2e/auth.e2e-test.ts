import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';
import { setupApp } from '../utils/setup-app';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest
      .fn()
      .mockResolvedValue('mock_google_access_token'),
    getUserInfo: jest.fn().mockResolvedValue({
      email: 'test@example.com',
      profileUrl: 'http://example.com/profile.jpg',
      sub: '1234567890',
    }),
  };

  jest.setTimeout(30000);

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

    dataSource = app.get(DataSource);
    try {
      await dataSource.dropDatabase();
      await dataSource.synchronize(true);
    } catch (e) {
      console.error('DB Sync Error:', e);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/login/url/google', () => {
    it('구글 로그인 URL을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/auth/login/url/google')
        .expect(200);

      const body = response.body as { url: string };
      expect(body).toHaveProperty('url');
      expect(body.url).toContain('accounts.google.com');
    });
  });

  describe('GET /auth/signup/oauth', () => {
    it('구글 인증 코드로 토큰을 발급받아야 한다', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/auth/signup/oauth?code=mock_code')
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      // Just accessing properties to verify existence is okay with supertest types usually,
      // but if we were strictly typed:
      const body = response.body as {
        accessToken: string;
        refreshToken: string;
      };
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });
  });
});
