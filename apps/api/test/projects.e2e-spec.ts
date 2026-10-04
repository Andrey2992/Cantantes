import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/configure-app.js';
import { PROJECT_REPOSITORY } from '../src/application/project/project-repository.token.js';
import { Project } from '../src/domain/project/entities/Project.js';
import type { ProjectRepository } from '../src/domain/project/repositories/ProjectRepository.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { InMemoryProjectRepository } from './doubles/in-memory-project.repository.js';

const seeded = Project.create(
  {
    id: 'prj_01',
    slug: 'sade',
    title: 'Sade',
    theme: { from: '#1f140e', to: '#5a3c22', accent: '#c9a227' },
  },
  new Date('2026-01-01T00:00:00.000Z'),
);

const projectResponse = {
  slug: 'sade',
  title: 'Sade',
  theme: { from: '#1f140e', to: '#5a3c22', accent: '#c9a227' },
};

/** Database-free stand-in for the port, used to simulate a storage failure. */
class FailingProjectRepository implements ProjectRepository {
  async findById(): Promise<Project | null> {
    throw new Error(
      'connect ECONNREFUSED 127.0.0.1:5432: password authentication failed',
    );
  }

  async findBySlug(): Promise<Project | null> {
    throw new Error(
      'connect ECONNREFUSED 127.0.0.1:5432: password authentication failed',
    );
  }

  async findAll(): Promise<Project[]> {
    throw new Error(
      'connect ECONNREFUSED 127.0.0.1:5432: password authentication failed',
    );
  }

  async save(): Promise<void> {
    throw new Error('not implemented');
  }
}

describe('Projects API (e2e)', () => {
  let app: INestApplication;

  async function createApp(repository: ProjectRepository): Promise<void> {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      // The persistence port and the client are replaced so these tests need no
      // PostgreSQL instance.
      .overrideProvider(PROJECT_REPOSITORY)
      .useValue(repository)
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  }

  afterEach(async () => {
    await app.close();
  });

  describe('with a stored project', () => {
    beforeEach(async () => {
      await createApp(new InMemoryProjectRepository([seeded]));
    });

    it('GET /projects returns the roster as the shared contract', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(200);

      expect(response.body).toEqual([projectResponse]);
    });

    it('GET /projects/:slug returns one project', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects/sade')
        .expect(200);

      expect(response.body).toEqual(projectResponse);
    });

    it('GET /projects/:slug answers 404 for an unknown slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects/avicii')
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        error: 'Not Found',
        message: 'Project not found',
      });
    });

    it.each(['Sade', 'bad bunny', '-sade', 'sade-', 'bad--bunny'])(
      'GET /projects/%s answers 400 for a non-canonical slug',
      async (slug) => {
        const response = await request(app.getHttpServer())
          .get(`/projects/${encodeURIComponent(slug)}`)
          .expect(400);

        expect(response.body).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid project slug',
        });
      },
    );

    it('allows the configured frontend origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3000',
      );
    });

    it('does not allow an unknown origin', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Origin', 'http://evil.example');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('when the repository fails', () => {
    beforeEach(async () => {
      await createApp(new FailingProjectRepository());
    });

    it('answers 500 without leaking the internal failure', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        error: 'Error',
        message: 'Internal server error',
      });
      expect(JSON.stringify(response.body)).not.toContain('ECONNREFUSED');
      expect(JSON.stringify(response.body)).not.toContain('5432');
    });
  });
});
