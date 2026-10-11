import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();

  return { ...actual, submitContactMessage: vi.fn() };
});

import { submitContactMessage } from '../lib/api';
import { ApiError, ApiNetworkError } from '../lib/api/errors';
import { submitContactMessageAction } from '../features/contact/action';
import type { ContactFormState } from '../features/contact/types';

/**
 * EN: Tests for the contact Server Action: it validates first, submits second, and
 * only reports success after the API confirms persistence.
 *
 * ES: Pruebas de la Server Action de contacto: valida primero, envía después, y
 * solo reporta éxito tras confirmar la API que persistió.
 */

const submitMock = vi.mocked(submitContactMessage);
const idle: ContactFormState = { status: 'idle' };

function formDataOf(fields: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}

beforeEach(() => {
  submitMock.mockReset();
});

describe('submitContactMessageAction', () => {
  it('returns invalid and does not call the API when validation fails', async () => {
    const result = await submitContactMessageAction(
      idle,
      formDataOf({ name: '', email: 'nope', message: '' }),
    );

    expect(result).toEqual({
      status: 'invalid',
      errors: { name: 'required', email: 'invalid-format', message: 'required' },
    });
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('returns success and submits normalized values after a confirmed acknowledgment', async () => {
    submitMock.mockResolvedValue({ status: 'received' });

    const result = await submitContactMessageAction(
      idle,
      formDataOf({
        name: '  Ada Lovelace ',
        email: ' ADA@Example.com ',
        message: ' Hello ',
      }),
    );

    expect(result).toEqual({ status: 'success' });
    expect(submitMock).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Hello',
    });
  });

  it('returns a generic error when the API rejects the request', async () => {
    submitMock.mockRejectedValue(new ApiError(400, null, 'Invalid name'));

    const result = await submitContactMessageAction(
      idle,
      formDataOf({ name: 'Ada', email: 'ada@example.com', message: 'Hi' }),
    );

    expect(result.status).toBe('error');
  });

  it('returns a generic error when the API is unreachable', async () => {
    submitMock.mockRejectedValue(new ApiNetworkError('offline'));

    const result = await submitContactMessageAction(
      idle,
      formDataOf({ name: 'Ada', email: 'ada@example.com', message: 'Hi' }),
    );

    expect(result.status).toBe('error');
  });
});
