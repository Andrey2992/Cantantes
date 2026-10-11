import { describe, expect, it } from 'vitest';
import { submitContactMessage } from '../lib/api/contact';
import { listExperience } from '../lib/api/experience';
import { ApiError, ApiParseError } from '../lib/api/errors';
import { getHealth } from '../lib/api/health';
import { getProjectBySlug, listProjects } from '../lib/api/projects';
import { listSkills } from '../lib/api/skills';
import { createFetchMock, jsonResponse, readJsonBody } from './helpers';

/**
 * EN: Tests for the resource modules: endpoint paths, contract validation and the
 * special cases (project 404/400, health 503).
 *
 * ES: Pruebas de los módulos de recurso: rutas de endpoints, validación de
 * contratos y los casos especiales (proyecto 404/400, salud 503).
 */

const BASE = 'http://api.test';

const project = {
  slug: 'belen-jones',
  title: 'Belen Jones',
  theme: { from: '#73a9ad', to: '#eef5f5', accent: '#73a9ad' },
};

const experience = {
  company: 'Acme',
  role: 'Engineer',
  summary: null,
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: null,
};

const skill = { name: 'TypeScript', category: 'Languages' };

describe('listProjects', () => {
  it('returns the validated project array', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse([project]));

    await expect(listProjects({ baseUrl: BASE, fetchImpl: impl })).resolves.toEqual([
      project,
    ]);
    expect(calls[0]?.url).toBe('http://api.test/api/v1/projects');
  });

  it('returns an empty array without inventing data', async () => {
    const { impl } = createFetchMock(() => jsonResponse([]));

    await expect(listProjects({ baseUrl: BASE, fetchImpl: impl })).resolves.toEqual([]);
  });

  it('throws ApiParseError on a malformed array', async () => {
    const { impl } = createFetchMock(() => jsonResponse({ not: 'an array' }));

    await expect(
      listProjects({ baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});

describe('getProjectBySlug', () => {
  it('returns the project when found', async () => {
    const { impl } = createFetchMock(() => jsonResponse(project));

    await expect(
      getProjectBySlug('belen-jones', { baseUrl: BASE, fetchImpl: impl }),
    ).resolves.toEqual(project);
  });

  it('encodes the slug in the URL', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse(project));

    await getProjectBySlug('a b/c', { baseUrl: BASE, fetchImpl: impl });

    expect(calls[0]?.url).toBe('http://api.test/api/v1/projects/a%20b%2Fc');
  });

  it('returns null on 404 (unknown project)', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ statusCode: 404, error: 'Not Found', message: 'Project not found' }, 404),
    );

    await expect(
      getProjectBySlug('missing', { baseUrl: BASE, fetchImpl: impl }),
    ).resolves.toBeNull();
  });

  it('returns null on 400 (non-canonical slug)', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ statusCode: 400, error: 'Bad Request', message: 'Invalid project slug' }, 400),
    );

    await expect(
      getProjectBySlug('Bad_Slug', { baseUrl: BASE, fetchImpl: impl }),
    ).resolves.toBeNull();
  });

  it('rethrows other statuses', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ statusCode: 500, error: 'Internal Server Error', message: 'Internal server error' }, 500),
    );

    await expect(
      getProjectBySlug('belen-jones', { baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiParseError when a 200 body is malformed', async () => {
    const { impl } = createFetchMock(() => jsonResponse({ slug: 'x' }));

    await expect(
      getProjectBySlug('x', { baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});

describe('listExperience', () => {
  it('returns the validated experience array', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse([experience]));

    await expect(
      listExperience({ baseUrl: BASE, fetchImpl: impl }),
    ).resolves.toEqual([experience]);
    expect(calls[0]?.url).toBe('http://api.test/api/v1/experience');
  });

  it('throws ApiParseError on a malformed element', async () => {
    const { impl } = createFetchMock(() => jsonResponse([{ company: 'Acme' }]));

    await expect(
      listExperience({ baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});

describe('listSkills', () => {
  it('returns the validated skill array', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse([skill]));

    await expect(listSkills({ baseUrl: BASE, fetchImpl: impl })).resolves.toEqual([
      skill,
    ]);
    expect(calls[0]?.url).toBe('http://api.test/api/v1/skills');
  });

  it('throws ApiParseError on a malformed element', async () => {
    const { impl } = createFetchMock(() => jsonResponse([{ category: null }]));

    await expect(
      listSkills({ baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});

describe('submitContactMessage', () => {
  it('POSTs the input and returns the acknowledgment', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse({ status: 'received' }, 201));

    await expect(
      submitContactMessage(
        { name: 'Ada', email: 'ada@example.com', message: 'Hi' },
        { baseUrl: BASE, fetchImpl: impl },
      ),
    ).resolves.toEqual({ status: 'received' });

    const call = calls[0];

    expect(call?.url).toBe('http://api.test/api/v1/contact');
    expect(call?.init?.method).toBe('POST');
    expect(call ? readJsonBody(call) : null).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hi',
    });
  });

  it('throws ApiError when the backend rejects a field', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ statusCode: 400, error: 'Bad Request', message: 'Invalid email address' }, 400),
    );

    await expect(
      submitContactMessage(
        { name: 'Ada', email: 'nope', message: 'Hi' },
        { baseUrl: BASE, fetchImpl: impl },
      ),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400 });
  });

  it('throws ApiParseError when the acknowledgment shape is unexpected', async () => {
    const { impl } = createFetchMock(() => jsonResponse({ status: 'queued' }, 201));

    await expect(
      submitContactMessage(
        { name: 'Ada', email: 'ada@example.com', message: 'Hi' },
        { baseUrl: BASE, fetchImpl: impl },
      ),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});

describe('getHealth', () => {
  it('returns the report on 200', async () => {
    const { impl, calls } = createFetchMock(() =>
      jsonResponse({ status: 'ok', database: 'up' }),
    );

    await expect(getHealth({ baseUrl: BASE, fetchImpl: impl })).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    expect(calls[0]?.url).toBe('http://api.test/api/health');
  });

  it('accepts a 503 degraded report as data (does not throw)', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ status: 'degraded', database: 'down' }, 503),
    );

    await expect(getHealth({ baseUrl: BASE, fetchImpl: impl })).resolves.toEqual({
      status: 'degraded',
      database: 'down',
    });
  });

  it('throws ApiError on an unexpected status', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ statusCode: 500, error: 'Internal Server Error', message: 'Internal server error' }, 500),
    );

    await expect(
      getHealth({ baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiParseError on a malformed report', async () => {
    const { impl } = createFetchMock(() => jsonResponse({ status: 'ok' }));

    await expect(
      getHealth({ baseUrl: BASE, fetchImpl: impl }),
    ).rejects.toBeInstanceOf(ApiParseError);
  });
});
