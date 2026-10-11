import { describe, expect, it } from 'vitest';
import { apiFetch, apiRequest } from '../lib/api/client';
import { ApiError } from '../lib/api/errors';
import { createFetchMock, jsonResponse, readJsonBody, textResponse } from './helpers';

/**
 * EN: Tests for the HTTP transport: success, error envelopes, non-JSON bodies,
 * network failures and malformed JSON.
 *
 * ES: Pruebas del transporte HTTP: éxito, envoltorios de error, cuerpos no JSON,
 * fallos de red y JSON malformado.
 */
const BASE = 'http://api.test';

describe('apiFetch', () => {
  it('returns the parsed body on success', async () => {
    const { impl } = createFetchMock(() => jsonResponse({ ok: true }));

    await expect(
      apiFetch<{ ok: boolean }>('/api/v1/projects', {
        baseUrl: BASE,
        fetchImpl: impl,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it('builds the URL from the base URL and the path', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse([]));

    await apiFetch('/api/v1/projects', { baseUrl: 'http://api.test/', fetchImpl: impl });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('http://api.test/api/v1/projects');
  });

  it('sends a JSON body and headers for POST', async () => {
    const { impl, calls } = createFetchMock(() => jsonResponse({ status: 'received' }, 201));

    await apiFetch('/api/v1/contact', {
      baseUrl: 'http://api.test',
      fetchImpl: impl,
      method: 'POST',
      body: { name: 'Ada' },
    });

    const call = calls[0];

    expect(call?.init?.method).toBe('POST');
    expect(call?.init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(call?.init?.cache).toBe('no-store');
    expect(call ? readJsonBody(call) : null).toEqual({ name: 'Ada' });
  });

  it('throws ApiError with the parsed envelope on a non-2xx status', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse(
        { statusCode: 404, error: 'Not Found', message: 'Project not found' },
        404,
      ),
    );

    await expect(
      apiFetch('/api/v1/projects/missing', { baseUrl: 'http://api.test', fetchImpl: impl }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Project not found',
      body: { statusCode: 404, error: 'Not Found', message: 'Project not found' },
    });
  });

  it('throws ApiError with a null body when a failure body is not JSON', async () => {
    const { impl } = createFetchMock(() => textResponse('<html>503</html>', 503));

    try {
      await apiFetch('/api/v1/projects', { baseUrl: 'http://api.test', fetchImpl: impl });
      throw new Error('expected apiFetch to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(503);
      expect((error as ApiError).body).toBeNull();
    }
  });

  it('wraps a network failure in ApiNetworkError', async () => {
    const { impl } = createFetchMock(() => {
      throw new TypeError('fetch failed');
    });

    await expect(
      apiFetch('/api/v1/projects', { baseUrl: 'http://api.test', fetchImpl: impl }),
    ).rejects.toMatchObject({ name: 'ApiNetworkError' });
  });

  it('throws ApiParseError when a 2xx body is not JSON', async () => {
    const { impl } = createFetchMock(() => textResponse('not json', 200));

    await expect(
      apiFetch('/api/v1/projects', { baseUrl: 'http://api.test', fetchImpl: impl }),
    ).rejects.toMatchObject({ name: 'ApiParseError', status: 200 });
  });

  it('throws ApiParseError when a 2xx body is empty', async () => {
    const { impl } = createFetchMock(() => new Response('', { status: 200 }));

    await expect(
      apiFetch('/api/v1/projects', { baseUrl: 'http://api.test', fetchImpl: impl }),
    ).rejects.toMatchObject({ name: 'ApiParseError' });
  });
});

/**
 * EN: `apiRequest` is the status-agnostic primitive used by the health resource.
 *
 * ES: `apiRequest` es la primitiva independiente del estado que usa el recurso de
 * salud.
 */
describe('apiRequest', () => {
  it('does not throw for a non-2xx status and returns the parsed body', async () => {
    const { impl } = createFetchMock(() =>
      jsonResponse({ status: 'degraded', database: 'down' }, 503),
    );

    const result = await apiRequest('/api/health', {
      baseUrl: 'http://api.test',
      fetchImpl: impl,
    });

    expect(result.status).toBe(503);
    expect(result.data).toEqual({ status: 'degraded', database: 'down' });
  });

  it('returns an undefined body for a non-2xx non-JSON response', async () => {
    const { impl } = createFetchMock(() => textResponse('nope', 500));

    const result = await apiRequest('/api/health', {
      baseUrl: 'http://api.test',
      fetchImpl: impl,
    });

    expect(result.status).toBe(500);
    expect(result.data).toBeUndefined();
  });
});
