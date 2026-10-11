import { DomainError } from '../errors/DomainError.js';
import { EmailAddress } from './EmailAddress.js';

describe('EmailAddress', () => {
  it('trims and lowercases the address to one canonical form', () => {
    expect(EmailAddress.of('  Someone@Example.COM  ').value).toBe(
      'someone@example.com',
    );
  });

  it('keeps a local part with dots, plus and hyphens', () => {
    expect(EmailAddress.of('first.last+tag@sub.example.com').value).toBe(
      'first.last+tag@sub.example.com',
    );
  });

  it('rejects a non-string value', () => {
    expect(() => EmailAddress.of(123 as unknown as string)).toThrow(
      DomainError,
    );
  });

  it('rejects addresses without an @ or a domain dot', () => {
    expect(() => EmailAddress.of('someone.example.com')).toThrow(DomainError);
    expect(() => EmailAddress.of('someone@example')).toThrow(DomainError);
  });

  it('rejects addresses containing whitespace', () => {
    expect(() => EmailAddress.of('some one@example.com')).toThrow(DomainError);
  });

  it('rejects a local part longer than the bound', () => {
    expect(() => EmailAddress.of(`${'a'.repeat(65)}@example.com`)).toThrow(
      DomainError,
    );
  });

  it('compares by canonical value', () => {
    expect(
      EmailAddress.of('A@example.com').equals(EmailAddress.of('a@example.com')),
    ).toBe(true);
  });
});
