import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/configure-app.js';
import { SKILL_REPOSITORY } from '../src/application/skill/skill-repository.token.js';
import { Skill } from '../src/domain/skill/entities/Skill.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { InMemorySkillRepository } from './doubles/in-memory-skill.repository.js';

const typescript = Skill.create({
  id: 'skl_01',
  name: 'TypeScript',
  category: 'Languages',
});

const postgres = Skill.create({
  id: 'skl_02',
  name: 'PostgreSQL',
  category: null,
});

describe('Skills API (e2e)', () => {
  async function createApp(skills: readonly Skill[]) {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SKILL_REPOSITORY)
      .useValue(new InMemorySkillRepository(skills))
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    const app = moduleFixture.createNestApplication<INestApplication>();
    configureApp(app);
    await app.init();

    return app;
  }

  it('GET /api/v1/skills returns the roster mapped to the contract', async () => {
    const app = await createApp([typescript, postgres]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/skills')
      .expect(200);

    expect(response.body).toEqual([
      { name: 'TypeScript', category: 'Languages' },
      { name: 'PostgreSQL', category: null },
    ]);

    await app.close();
  });

  it('GET /api/v1/skills returns an empty array when nothing is stored', async () => {
    const app = await createApp([]);

    const response = await request(app.getHttpServer())
      .get('/api/v1/skills')
      .expect(200);

    expect(response.body).toEqual([]);

    await app.close();
  });
});
