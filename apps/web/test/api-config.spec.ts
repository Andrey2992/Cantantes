import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiBaseUrl } from '../lib/api/config';
import { ApiConfigError, isApiConfigError } from '../lib/api/errors';

/**
 * EN: Tests for the centralized base URL resolution.
 *
 * ES: Pruebas de la resolución centralizada de la URL base.
 */
describe('resolveApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes a valid http URL', () => {
    expect(resolveApiBaseUrl('http://localhost:3001')).toBe(
      'http://localhost:3001',
    );
  });

  it('trims surrounding whitespace and drops a trailing slash', () => {
    expect(resolveApiBaseUrl('  https://api.example.com/  ')).toBe(
      'https://api.example.com',
    );
  });

  it('preserves a base path prefix', () => {
    expect(resolveApiBaseUrl('https://example.com/api-root')).toBe(
      'https://example.com/api-root',
    );
  });

  it('throws when the value is missing or blank', () => {
    expect(() => resolveApiBaseUrl('')).toThrow(ApiConfigError);
    expect(() => resolveApiBaseUrl('   ')).toThrow(ApiConfigError);
  });

  it('throws when the value is not an absolute URL', () => {
    expect(() => resolveApiBaseUrl('/relative/path')).toThrow(ApiConfigError);
  });

  it('throws for a non-http(s) protocol', () => {
    expect(() => resolveApiBaseUrl('ftp://example.com')).toThrow(ApiConfigError);
  });

  it('refuses to run in a browser bundle', () => {
    vi.stubGlobal('window', {});

    try {
      resolveApiBaseUrl('http://localhost:3001');
      throw new Error('expected resolveApiBaseUrl to throw');
    } catch (error) {
      expect(isApiConfigError(error)).toBe(true);
    }
  });
});
