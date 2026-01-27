import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from '../utils/seed-db';
import { setupApp } from '../utils/setup-app';

describe('DocumentController (e2e)', () => {
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

  describe('GET /document', () => {
    it('요청이 성공하면 200 상태코드와 문서 목록을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/document?type=COVER&page=1')
        .expect(200);

      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
      expect(response.body).toHaveProperty('totalPage');
    });

    it('유효하지 않은 type 파라미터 요청 시 400 에러를 반환해야 한다', async () => {
      return request(app.getHttpServer())
        .get('/document?type=INVALID')
        .expect(400);
    });
  });

  describe('POST /document/cover-letter/create', () => {
    it('자기소개서를 생성하고 201 상태코드를 반환해야 한다', async () => {
      const dto = {
        title: 'New Cover Letter',
        content: [{ question: 'Q1', answer: 'A1' }],
      };

      const response = await request(app.getHttpServer())
        .post('/document/cover-letter/create')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('documentId');
      expect(response.body.title).toBe(dto.title);
    });

    it('제목(title) 누락 시 400 에러를 반환해야 한다', async () => {
      const dto = {
        content: [{ question: 'Q1', answer: 'A1' }],
      };
      return request(app.getHttpServer())
        .post('/document/cover-letter/create')
        .send(dto)
        .expect(400);
    });
  });

  describe('GET /document/{id}/cover-letter', () => {
    it('존재하는 자기소개서 ID 조회 시 200 상태코드와 데이터를 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get('/document/1/cover-letter')
        .expect(200);

      expect(response.body.documentId).toBe('1');
      expect(response.body.type).toBe('COVER');
    });

    it('존재하지 않는 ID 조회 시 404 에러를 반환해야 한다', async () => {
      return request(app.getHttpServer())
        .get('/document/99999/cover-letter')
        .expect(404);
    });
  });
});
