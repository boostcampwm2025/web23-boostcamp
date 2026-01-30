import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';

describe('User (Blackbox)', () => {
  let app: INestApplication;
  let accessToken: string;

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest
      .fn()
      .mockResolvedValue('mock_google_access_token_user'),
    getUserInfo: jest.fn().mockResolvedValue({
      email: 'user_blackbox_user@example.com',
      firstName: 'User',
      lastName: 'Tester',
      picture: 'https://example.com/user_tester.jpg',
      sub: 'user_blackbox_user_sub',
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
      .query({ code: 'mock_auth_code_user' })
      .expect(200);

    accessToken = (authResponse.body as { accessToken: string }).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. 내 정보 조회 (GET /user/me)', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/user/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty(
      'email',
      'user_blackbox_user@example.com',
    );
    // nickname might not be in UserInfoResponse if it just returns entity props mapped.
    // Let's check UserInfoResponse dto or just check generic properties.
    // Entity has user_email, user_id.
    // Let's assume response DTO maps them.
  });
});
