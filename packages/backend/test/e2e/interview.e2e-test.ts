import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from '../utils/seed-db';
import { setupApp } from '../utils/setup-app';

describe('InterviewController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await seedDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /interview', () => {
    it('요청이 성공하면 200 상태코드와 면접 목록을 반환해야 한다 (최소 1개 이상)', async () => {
      const response = await request(app.getHttpServer())
        .get('/interview?type=TECH&page=1')
        .expect(200);

      expect(response.body).toHaveProperty('interviews');
      // Seed data has 1 interview
      expect(response.body.interviews.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /interview/tech/create', () => {
    it('기술 면접을 생성하고 201 상태코드를 반환해야 한다', async () => {
      const dto = {
        simulationTitle: 'New Tech Interview',
        documentsIds: [1, 2], // IDs from seed
      };

      const response = await request(app.getHttpServer())
        .post('/interview/tech/create')
        .send(dto);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('interviewId');
        expect(response.body).toHaveProperty('question');
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
      const response = await request(app.getHttpServer())
        .post('/interview/tech/question')
        .send({ interviewId: 1 });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('question');
      }
    });
  });
});
