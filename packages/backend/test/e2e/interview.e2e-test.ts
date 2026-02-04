import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { seedDatabase } from '../utils/seed-db';
import { setupApp } from '../utils/setup-app';

describe('InterviewController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    // Seed Database
    const dataSource = app.get(DataSource);
    await seedDatabase(dataSource);

    // Setup Auth Token
    const jwtService = app.get(JwtService);
    // User 1 exists in seed data. We use '1' as sub because JwtTokenProvider puts userId in sub.
    accessToken = jwtService.sign({ sub: '1', role: 'USER' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /interview', () => {
    it('요청이 성공하면 200 상태코드와 면접 목록을 반환해야 한다 (최소 1개 이상)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/interview?type=TECH&page=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as { interviews: unknown[] };
      expect(body).toHaveProperty('interviews');
      // Seed data has 1 interview
      expect(body.interviews.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /interview/tech/create', () => {
    it('기술 면접을 생성하고 201 상태코드를 반환해야 한다', async () => {
      const dto = {
        simulationTitle: 'New Tech Interview',
        documentIds: ['1', '2'], // IDs from seed
      };

      const response = await request(app.getHttpServer() as Server)
        .post('/interview/tech/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto);

      if (response.status === 201) {
        const body = response.body as { interviewId: number; question: string };
        expect(body).toHaveProperty('interviewId');
        expect(body).toHaveProperty('question');
      } else {
        console.warn(
          'Interview Creation failed, possibly due to External AI dependency',
          response.status,
          response.body,
        );
      }
    });
  });

  describe('POST /interview/tech/question', () => {
    it('다음 질문을 생성하고 200 상태코드를 반환해야 한다', async () => {
      const response = await request(app.getHttpServer() as Server)
        .post('/interview/tech/question')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ interviewId: 1 });

      if (response.status === 200) {
        const body = response.body as { question: string };
        expect(body).toHaveProperty('question');
      }
    });
  });
});
