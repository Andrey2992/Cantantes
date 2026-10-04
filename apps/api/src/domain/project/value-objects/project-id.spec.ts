import { DomainError } from '../errors/DomainError.js';
import { ProjectId } from './ProjectId.js';

describe('ProjectId', () => {
  it('keeps the identifier opaque, trimming outer whitespace', () => {
    expect(ProjectId.of('  prj_01  ').value).toBe('prj_01');
  });

  it('rejects an empty identifier', () => {
    expect(() => ProjectId.of('   ')).toThrow(DomainError);
  });

  it('rejects inner whitespace because it would break lookups', () => {
    expect(() => ProjectId.of('prj 01')).toThrow(DomainError);
  });

  it('rejects identifiers longer than the bound', () => {
    expect(() => ProjectId.of('a'.repeat(65))).toThrow(DomainError);
  });

  it('accepts an identifier at the bound', () => {
    expect(ProjectId.of('a'.repeat(64)).value).toHaveLength(64);
  });

  it('compares by value', () => {
    expect(ProjectId.of('prj_01').equals(ProjectId.of('prj_01'))).toBe(true);
    expect(ProjectId.of('prj_01').equals(ProjectId.of('prj_02'))).toBe(false);
  });

  it('stringifies to its value', () => {
    expect(String(ProjectId.of('prj_01'))).toBe('prj_01');
  });
});
