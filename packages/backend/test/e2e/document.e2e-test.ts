import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { seedDatabase } from '../utils/seed-db';
import { setupApp } from '../utils/setup-app';

describe('DocumentController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await seedDatabase(dataSource);

    // Setup Auth Token
    const jwtService = app.get(JwtService);
    // User 1 exists in seed data. We use '1' as sub because JwtTokenProvider puts userId in sub.
    accessToken = jwtService.sign({ sub: '1', role: 'USER' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /document', () => {
    it('요청이 성공하면 200 상태코드와 문서 목록을 반환해야 한다', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/document?type=COVER&page=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as { documents: unknown[]; totalPage: number };
      expect(body).toHaveProperty('documents');
      expect(Array.isArray(body.documents)).toBe(true);
      expect(body).toHaveProperty('totalPage');
    });

    it('유효하지 않은 type 파라미터 요청 시 400 에러를 반환해야 한다', async () => {
      return request(app.getHttpServer() as Server)
        .get('/document?type=INVALID')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('POST /document/cover-letter/create', () => {
    it('자기소개서를 생성하고 201 상태코드를 반환해야 한다', async () => {
      const dto = {
        title: 'New Cover Letter',
        content: [{ question: 'Q1', answer: 'A1' }],
      };

      const response = await request(app.getHttpServer() as Server)
        .post('/document/cover-letter/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      const body = response.body as { documentId: string; title: string };
      expect(body).toHaveProperty('documentId');
      expect(body.title).toBe(dto.title);
    });

    it('제목(title) 누락 시 400 에러를 반환해야 한다', async () => {
      const dto = {
        content: [{ question: 'Q1', answer: 'A1' }],
      };
      return request(app.getHttpServer() as Server)
        .post('/document/cover-letter/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(400);
    });
  });

  describe('GET /document/{id}/cover-letter', () => {
    it('존재하는 자기소개서 ID 조회 시 200 상태코드와 데이터를 반환해야 한다', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/document/1/cover-letter')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = response.body as { documentId: string; type: string };
      expect(body.documentId).toBe('1');
      expect(body.type).toBe('COVER');
    });

    it('존재하지 않는 ID 조회 시 404 에러를 반환해야 한다', async () => {
      return request(app.getHttpServer() as Server)
        .get('/document/99999/cover-letter')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
  describe('DELETE /document', () => {
    it('여러 문서를 일괄 삭제하고 결과를 반환해야 한다 (성공 케이스)', async () => {
      // 1. 테스트용 포트폴리오 2개 생성
      const createResponse1 = await request(app.getHttpServer() as Server)
        .post('/document/portfolio/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Delete Test 1', content: 'Content 1' })
        .expect(201);
      const docId1 = (createResponse1.body as { documentId: string })
        .documentId;

      const createResponse2 = await request(app.getHttpServer() as Server)
        .post('/document/portfolio/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Delete Test 2', content: 'Content 2' })
        .expect(201);
      const docId2 = (createResponse2.body as { documentId: string })
        .documentId;

      // 2. 일괄 삭제 요청
      const deleteResponse = await request(app.getHttpServer() as Server)
        .delete('/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentIds: [docId1, docId2] })
        .expect(200);

      const body = deleteResponse.body as {
        success: boolean;
        deletedCount: number;
        failedDocuments: string[];
      };
      expect(body.success).toBe(true);
      expect(body.deletedCount).toBe(2);
      expect(body.failedDocuments).toHaveLength(0);

      // 3. 삭제 확인 (조회 실패)
      await request(app.getHttpServer() as Server)
        .get(`/document/${docId1}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
      await request(app.getHttpServer() as Server)
        .get(`/document/${docId2}/portfolio`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('일부 문서만 존재할 경우 400 BadRequest를 반환해야 한다', async () => {
      // 1. 테스트용 포트폴리오 1개 생성
      const createResponse = await request(app.getHttpServer() as Server)
        .post('/document/portfolio/create')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Partial Delete Test', content: 'Content' })
        .expect(201);
      const docId = (createResponse.body as { documentId: string }).documentId;
      const nonExistentId = '999999';

      // 2. 일괄 삭제 요청 (존재 ID + 비존재 ID)
      await request(app.getHttpServer() as Server)
        .delete('/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentIds: [docId, nonExistentId] })
        .expect(400);
    });

    it('존재하지 않는 문서들만 요청 시 400 BadRequest를 반환해야 한다', async () => {
      const nonExistentId1 = '999998';
      const nonExistentId2 = '999999';

      await request(app.getHttpServer() as Server)
        .delete('/document')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ documentIds: [nonExistentId1, nonExistentId2] })
        .expect(400);
    });
  });
});
