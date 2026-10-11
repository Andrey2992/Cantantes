import { DomainError } from '../errors/DomainError.js';
import { EntityId } from './EntityId.js';

describe('EntityId', () => {
  it('keeps the identifier opaque, trimming outer whitespace', () => {
    expect(EntityId.of('  exp_01  ').value).toBe('exp_01');
  });

  it('rejects an empty identifier', () => {
    expect(() => EntityId.of('   ')).toThrow(DomainError);
  });

  it('rejects inner whitespace because it would break lookups', () => {
    expect(() => EntityId.of('exp 01')).toThrow(DomainError);
  });

  it('rejects identifiers longer than the bound', () => {
    expect(() => EntityId.of('a'.repeat(65))).toThrow(DomainError);
  });

  it('accepts an identifier at the bound', () => {
    expect(EntityId.of('a'.repeat(64)).value).toHaveLength(64);
  });

  it('compares by value', () => {
    expect(EntityId.of('exp_01').equals(EntityId.of('exp_01'))).toBe(true);
    expect(EntityId.of('exp_01').equals(EntityId.of('exp_02'))).toBe(false);
  });

  it('stringifies to its value', () => {
    expect(String(EntityId.of('exp_01'))).toBe('exp_01');
  });
});
