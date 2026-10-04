import { DomainError } from '../errors/DomainError.js';
import { ProjectSlug } from './ProjectSlug.js';
import { ProjectTitle } from './ProjectTitle.js';

describe('ProjectSlug', () => {
  describe('of', () => {
    it('accepts canonical kebab-case', () => {
      expect(ProjectSlug.of('the-neighbourhood').value).toBe(
        'the-neighbourhood',
      );
    });

    it('rejects uppercase so two casings cannot claim the same route', () => {
      expect(() => ProjectSlug.of('Sade')).toThrow(DomainError);
    });

    it('rejects spaces, leading, trailing and doubled hyphens', () => {
      expect(() => ProjectSlug.of('bad bunny')).toThrow(DomainError);
      expect(() => ProjectSlug.of('-sade')).toThrow(DomainError);
      expect(() => ProjectSlug.of('sade-')).toThrow(DomainError);
      expect(() => ProjectSlug.of('bad--bunny')).toThrow(DomainError);
    });

    it('rejects an empty slug', () => {
      expect(() => ProjectSlug.of('')).toThrow(DomainError);
    });

    it('rejects slugs longer than the bound', () => {
      expect(() => ProjectSlug.of('a'.repeat(81))).toThrow(DomainError);
    });
  });

  describe('fromTitle', () => {
    it('lowercases and hyphenates the title', () => {
      expect(
        ProjectSlug.fromTitle(ProjectTitle.of('The Neighbourhood')).value,
      ).toBe('the-neighbourhood');
    });

    it('folds accents so accented and unaccented titles share one route', () => {
      expect(ProjectSlug.fromTitle(ProjectTitle.of('Avicií')).value).toBe(
        'avicii',
      );
    });

    it('turns every run of non url-safe characters into a single hyphen', () => {
      expect(ProjectSlug.fromTitle(ProjectTitle.of('A$AP Rocky.')).value).toBe(
        'a-ap-rocky',
      );
    });

    it('trims leading and trailing separators', () => {
      expect(
        ProjectSlug.fromTitle(ProjectTitle.of('  ...Sade!!!  ')).value,
      ).toBe('sade');
    });

    it('fails when the title has no url-safe characters', () => {
      expect(() => ProjectSlug.fromTitle(ProjectTitle.of('***'))).toThrow(
        DomainError,
      );
    });
  });

  it('compares by value', () => {
    expect(ProjectSlug.of('sade').equals(ProjectSlug.of('sade'))).toBe(true);
    expect(ProjectSlug.of('sade').equals(ProjectSlug.of('avicii'))).toBe(false);
  });
});
