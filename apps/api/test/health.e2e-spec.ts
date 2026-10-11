import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/configure-app.js';
import { HEALTH_PROBE } from '../src/application/health/ports/health-probe.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { StubHealthProbe } from './doubles/stub-health-probe.js';

describe('Health API (e2e)', () => {
  async function createApp(database: 'up' | 'down') {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HEALTH_PROBE)
      .useValue(new StubHealthProbe(database))
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    const app = moduleFixture.createNestApplication<INestApplication>();
    configureApp(app);
    await app.init();

    return app;
  }

  it('GET /api/health answers 200 and ok when the database is up', async () => {
    const app = await createApp('up');

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok', database: 'up' });

    await app.close();
  });

  it('GET /api/health answers 503 and degraded when the database is down', async () => {
    const app = await createApp('down');

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body).toEqual({ status: 'degraded', database: 'down' });

    await app.close();
  });

  it('is version-neutral: /api/v1/health does not exist', async () => {
    const app = await createApp('up');

    await request(app.getHttpServer()).get('/api/v1/health').expect(404);

    await app.close();
  });
});
