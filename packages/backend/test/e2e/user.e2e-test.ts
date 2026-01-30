import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';
import { DataSource } from 'typeorm';
import { User } from '../../src/user/entities/user.entity';
import { JwtTokenProvider } from '../../src/auth/jwt-token.provider';
import { GoogleOAuthService } from '../../src/auth/google-oauth.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtTokenProvider: JwtTokenProvider;
  let accessToken: string;
  let user: User;

  const mockGoogleOAuthService = {
    exchangeCodeForToken: jest.fn(),
    getUserInfo: jest.fn(),
  };

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
    jwtTokenProvider = app.get(JwtTokenProvider);

    // DB Reset & Seed
    await dataSource.dropDatabase();
    await dataSource.synchronize(true);

    const userRepository = dataSource.getRepository(User);
    user = userRepository.create({
      userEmail: 'e2e@example.com',
      sub: 'google_12345',
      profileUrl: 'http://example.com/me.jpg',
    });
    await userRepository.save(user);

    accessToken = await jwtTokenProvider.generateAccessToken(
      user.userId,
      user.role,
      Date.now(),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /user/me', () => {
    it('유효한 토큰으로 요청 시 내 정보를 반환해야 한다 (200)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', user.userId);
      expect(response.body).toHaveProperty('email', user.userEmail);
      expect(response.body).toHaveProperty('profileUrl', user.profileUrl);
    });

    it('토큰이 없으면 401을 반환해야 한다', async () => {
      await request(app.getHttpServer() as Server)
        .get('/user/me')
        .expect(401);
    });
  });
});
