import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/configure-app.js';
import { CONTACT_MESSAGE_REPOSITORY } from '../src/application/contact/contact-message-repository.token.js';
import { ID_GENERATOR } from '../src/application/shared/ports/id-generator.js';
import { PrismaService } from '../src/infrastructure/database/prisma.service.js';
import { FakeIdGenerator } from './doubles/fake-id-generator.js';
import { InMemoryContactMessageRepository } from './doubles/in-memory-contact-message.repository.js';

const validBody = {
  name: 'Jane Doe',
  email: 'Jane@Example.com',
  message: 'Hello,\nI would like to talk.',
};

describe('Contact API (e2e)', () => {
  let repository: InMemoryContactMessageRepository;
  let app: INestApplication;

  beforeEach(async () => {
    repository = new InMemoryContactMessageRepository();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CONTACT_MESSAGE_REPOSITORY)
      .useValue(repository)
      .overrideProvider(ID_GENERATOR)
      .useValue(new FakeIdGenerator('msg_'))
      .overrideProvider(PrismaService)
      .useValue({ $connect: async () => {}, $disconnect: async () => {} })
      .compile();

    app = moduleFixture.createNestApplication<INestApplication>();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/contact stores the message and answers 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send(validBody)
      .expect(201);

    expect(response.body).toEqual({ status: 'received' });
    expect(repository.stored).toHaveLength(1);
    expect(repository.stored[0]?.id.value).toBe('msg_1');
    expect(repository.stored[0]?.email.value).toBe('jane@example.com');
    expect(repository.stored[0]?.message.value).toBe(
      'Hello,\nI would like to talk.',
    );
  });

  it('normalizes the sender name', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({ ...validBody, name: '  Jane   Doe  ' })
      .expect(201);

    expect(repository.stored[0]?.name.value).toBe('Jane Doe');
  });

  it.each([
    ['a missing email', { name: 'Jane', message: 'Hi' }],
    ['a missing name', { email: 'jane@example.com', message: 'Hi' }],
    ['a missing message', { name: 'Jane', email: 'jane@example.com' }],
    [
      'a non-string name',
      { name: 42, email: 'jane@example.com', message: 'Hi' },
    ],
  ])('answers 400 for %s without storing anything', async (_label, body) => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send(body)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: expect.any(String),
    });
    expect(repository.stored).toHaveLength(0);
  });

  it('answers 400 for an invalid email and never echoes it', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({ ...validBody, email: 'not-an-email' })
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid email address',
    });
    expect(JSON.stringify(response.body)).not.toContain('not-an-email');
    expect(repository.stored).toHaveLength(0);
  });

  it('answers 400 when the body is not a JSON object', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/contact')
      .send(['not', 'an', 'object'])
      .expect(400);

    expect(response.body.message).toBe('Request body must be a JSON object');
    expect(repository.stored).toHaveLength(0);
  });
});
