import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/configure-app.js';
import { EXPERIENCE_REPOSITORY } from '../src/application/experience/experience-repository.token.js';
import { Experience } from '../src/domain/experience/entities/Experience.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { InMemoryExperienceRepository } from './doubles/in-memory-experience.repository.js';

const ongoing = Experience.create({
  id: 'exp_01',
  company: 'Acme',
  role: 'Backend Engineer',
  summary: 'Built services.',
  period: {
    start: new Date('2021-01-01T00:00:00.000Z'),
    end: null,
  },
});

const closed = Experience.create({
  id: 'exp_02',
  company: 'Globex',
  role: 'Intern',
  period: {
    start: new Date('2019-01-01T00:00:00.000Z'),
    end: new Date('2019-12-31T00:00:00.000Z'),
  },
});

describe('Experience API (e2e)', () => {
  async function createApp(experiences: readonly Experience[]) {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EXPERIENCE_REPOSITORY)
      .useValue(new InMemoryExperienceRepository(experiences))
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    const app = moduleFixture.createNestApplication<INestApplication>();
    configureApp(app);
    await app.init();

    return app;
  }

  it('GET /api/v1/experience returns the roster mapped to the contract', async () => {
    const app = await createApp([ongoing, closed]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/experience')
      .expect(200);

    expect(response.body).toEqual([
      {
        company: 'Acme',
        role: 'Backend Engineer',
        summary: 'Built services.',
        startDate: '2021-01-01T00:00:00.000Z',
        endDate: null,
      },
      {
        company: 'Globex',
        role: 'Intern',
        summary: null,
        startDate: '2019-01-01T00:00:00.000Z',
        endDate: '2019-12-31T00:00:00.000Z',
      },
    ]);

    await app.close();
  });

  it('GET /api/v1/experience returns an empty array when nothing is stored', async () => {
    const app = await createApp([]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/experience')
      .expect(200);

    expect(response.body).toEqual([]);

    await app.close();
  });
});
