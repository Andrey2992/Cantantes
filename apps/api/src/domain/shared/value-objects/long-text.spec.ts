import { DomainError } from '../errors/DomainError.js';
import { LongText } from './LongText.js';

const options = { field: 'Message', maxLength: 20 };

describe('LongText', () => {
  it('preserves internal line breaks and tabs', () => {
    expect(LongText.of(' line one\n\tline two ', options).value).toBe(
      'line one\n\tline two',
    );
  });

  it('keeps internal spacing untouched', () => {
    expect(LongText.of('a   b', options).value).toBe('a   b');
  });

  it('rejects a non-string value', () => {
    expect(() => LongText.of(null as unknown as string, options)).toThrow(
      DomainError,
    );
  });

  it('rejects control characters other than newline and tab', () => {
    expect(() => LongText.of('bad\u0007bell', options)).toThrow(DomainError);
  });

  it('rejects an empty value', () => {
    expect(() => LongText.of('   \n  ', options)).toThrow(DomainError);
  });

  it('names the offending field in the error message', () => {
    expect(() => LongText.of('', options)).toThrow(/Message/);
  });

  it('rejects values longer than the bound', () => {
    expect(() => LongText.of('a'.repeat(21), options)).toThrow(DomainError);
  });

  it('compares by value', () => {
    expect(
      LongText.of(' hi ', options).equals(LongText.of('hi', options)),
    ).toBe(true);
  });
});
