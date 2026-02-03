import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../../src/app.module';
import { setupApp } from '../utils/setup-app';

describe('HealthController (Blackbox)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /health', () => {
    it('헬스 체크 (200 OK, Google/Clova 상태 반환)', async () => {
      const response = await request(app.getHttpServer() as Server)
        .get('/health')
        .expect(200);

      const body = response.body as {
        status: string;
        external: { google: string; clova: string };
      };

      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('external');
      expect(body.external).toHaveProperty('google');
      expect(body.external).toHaveProperty('clova');

      // 상태는 'up' 또는 'down'이어야 함
      expect(['up', 'down']).toContain(body.external.google);
      expect(['up', 'down']).toContain(body.external.clova);

      console.log('Health Check Response:', body);
    });
  });
});
