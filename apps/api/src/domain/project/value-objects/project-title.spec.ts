import { DomainError } from '../errors/DomainError.js';
import { ProjectTitle } from './ProjectTitle.js';

describe('ProjectTitle', () => {
  it('trims and collapses internal whitespace runs', () => {
    expect(ProjectTitle.of('  Bad   Bunny  ').value).toBe('Bad Bunny');
  });

  it('preserves punctuation and casing used by the typographic index', () => {
    expect(ProjectTitle.of('A$AP Rocky.').value).toBe('A$AP Rocky.');
  });

  it('rejects an empty title', () => {
    expect(() => ProjectTitle.of('   ')).toThrow(DomainError);
  });

  it('rejects line breaks because the index renders one line per project', () => {
    expect(() => ProjectTitle.of('Bad Bunny\nThe Neighbourhood')).toThrow(
      DomainError,
    );
  });

  it('rejects tabs and other control characters', () => {
    expect(() => ProjectTitle.of('Bad\tBunny')).toThrow(DomainError);
    expect(() => ProjectTitle.of('Bad\u0007Bunny')).toThrow(DomainError);
  });

  it('rejects titles longer than the bound', () => {
    expect(() => ProjectTitle.of('a'.repeat(81))).toThrow(DomainError);
  });

  it('accepts a title at the bound', () => {
    expect(ProjectTitle.of('a'.repeat(80)).value).toHaveLength(80);
  });

  it('compares normalized values', () => {
    expect(ProjectTitle.of(' Sade ').equals(ProjectTitle.of('Sade'))).toBe(
      true,
    );
  });

  it('stringifies to its value', () => {
    expect(String(ProjectTitle.of('Sade'))).toBe('Sade');
  });
});
