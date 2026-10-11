import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  validateContactFields,
} from '../features/contact/validation';

/**
 * EN: Tests for the client-side contact validation that mirrors the backend
 * domain invariants.
 *
 * ES: Pruebas de la validación de contacto del cliente que refleja las invariantes
 * del dominio del backend.
 */
describe('validateContactFields', () => {
  it('accepts and normalizes valid values', () => {
    const result = validateContactFields({
      name: '  Ada   Lovelace  ',
      email: '  ADA@Example.COM  ',
      message: '  Hello,\nworld!  ',
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toEqual({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello,\nworld!',
      });
    }
  });

  it('reports required fields for missing values', () => {
    const result = validateContactFields({
      name: null,
      email: undefined,
      message: '',
    });

    expect(result).toEqual({
      ok: false,
      errors: { name: 'required', email: 'required', message: 'required' },
    });
  });

  it('rejects control characters in the name', () => {
    const result = validateContactFields({
      name: 'Ada\u0000Lovelace',
      email: 'ada@example.com',
      message: 'Hi',
    });

    expect(result).toEqual({
      ok: false,
      errors: { name: 'invalid-characters' },
    });
  });

  it('bounds the name length', () => {
    const result = validateContactFields({
      name: 'a'.repeat(CONTACT_NAME_MAX_LENGTH + 1),
      email: 'ada@example.com',
      message: 'Hi',
    });

    expect(result).toEqual({ ok: false, errors: { name: 'too-long' } });
  });

  it('rejects a malformed email', () => {
    const result = validateContactFields({
      name: 'Ada',
      email: 'not-an-email',
      message: 'Hi',
    });

    expect(result).toEqual({
      ok: false,
      errors: { email: 'invalid-format' },
    });
  });

  it('bounds the email local part length', () => {
    const result = validateContactFields({
      name: 'Ada',
      email: `${'a'.repeat(65)}@example.com`,
      message: 'Hi',
    });

    expect(result).toEqual({ ok: false, errors: { email: 'too-long' } });
  });

  it('allows newlines and tabs in the message', () => {
    const result = validateContactFields({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'line one\n\tline two',
    });

    expect(result.ok).toBe(true);
  });

  it('rejects other control characters in the message', () => {
    const result = validateContactFields({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'bad\u0000value',
    });

    expect(result).toEqual({
      ok: false,
      errors: { message: 'invalid-characters' },
    });
  });

  it('bounds the message length', () => {
    const result = validateContactFields({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'a'.repeat(CONTACT_MESSAGE_MAX_LENGTH + 1),
    });

    expect(result).toEqual({ ok: false, errors: { message: 'too-long' } });
  });
});
