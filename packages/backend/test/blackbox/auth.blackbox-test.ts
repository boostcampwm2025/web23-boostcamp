import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';

describe('Auth (Blackbox)', () => {
  let app: INestApplication;

  const mockGoogleOAuthService = {
    getGoogleRedirectUrl: jest
      .fn()
      .mockReturnValue(
        'https://accounts.google.com/o/oauth2/v2/auth?mocked=true',
      ),
    exchangeCodeForToken: jest
      .fn()
      .mockResolvedValue('mock_google_access_token'),
    getUserInfo: jest.fn().mockResolvedValue({
      email: 'new_blackbox_user@example.com',
      firstName: 'New',
      lastName: 'User',
      picture: 'https://example.com/new_user.jpg',
      sub: 'new_blackbox_user_sub',
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Google Login URL 요청 (GET /auth/login/url/google)', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/auth/login/url/google')
      .expect(200);

    // 응답이 JSON이고 url 속성이 있는지 확인
    const body = response.body as { url: string };
    expect(body).toHaveProperty('url');
    expect(body.url).toContain('https://accounts.google.com');
  });

  it('2. Google OAuth 회원가입 및 로그인 (GET /auth/signup/oauth)', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/auth/signup/oauth')
      .query({ code: 'mock_auth_code' })
      .expect(200);

    // Body에 accessToken, refreshToken이 설정되었는지 확인
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
});
