import { DomainError } from '../errors/DomainError.js';
import { ShortText } from './ShortText.js';

const options = { field: 'Company', maxLength: 10 };

describe('ShortText', () => {
  it('trims and collapses internal whitespace runs', () => {
    expect(ShortText.of('  Acme   Corp  ', options).value).toBe('Acme Corp');
  });

  it('preserves casing and punctuation because they are meaningful', () => {
    expect(ShortText.of('Node.js', options).value).toBe('Node.js');
  });

  it('rejects a non-string value', () => {
    expect(() => ShortText.of(42 as unknown as string, options)).toThrow(
      DomainError,
    );
  });

  it('rejects control characters, including line breaks', () => {
    expect(() => ShortText.of('Acme\nCorp', options)).toThrow(DomainError);
    expect(() => ShortText.of('Acme\tCorp', options)).toThrow(DomainError);
  });

  it('rejects an empty value', () => {
    expect(() => ShortText.of('   ', options)).toThrow(DomainError);
  });

  it('names the offending field in the error message', () => {
    expect(() => ShortText.of('', options)).toThrow(/Company/);
  });

  it('rejects values longer than the bound and accepts one at the bound', () => {
    expect(() => ShortText.of('a'.repeat(11), options)).toThrow(DomainError);
    expect(ShortText.of('a'.repeat(10), options).value).toHaveLength(10);
  });

  it('compares by normalized value', () => {
    expect(
      ShortText.of(' Acme ', options).equals(ShortText.of('Acme', options)),
    ).toBe(true);
  });
});
