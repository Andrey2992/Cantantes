import { DomainError } from '../errors/DomainError.js';
import type { ProjectTitle } from './ProjectTitle.js';

const MAX_LENGTH = 80;
const CANONICAL_FORM = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Combining diacritical marks, removed after an NFD decomposition so that
// "SÁNCHEZ" and "SANCHEZ" cannot produce two different slugs for one project.
const COMBINING_MARKS = /\p{M}/gu;

/**
 * Stable, canonical URL identity of a Project.
 *
 * Justified by the Stitch PRD roadmap (section 6, Phase 6): projects get their
 * own deep-dive pages, which means each project needs a route identity that is
 * stable across renames and comparable across projects. Folding case and accents
 * into one canonical form prevents two projects from being reachable through
 * visually identical but distinct URLs.
 *
 * Production policy: derived from the title by default, explicitly overridable.
 * Uniqueness is not asserted here — that requires a storage lookup and therefore
 * belongs to the repository, not to the value object (AGENTS.md section 8).
 */
export class ProjectSlug {
  private constructor(readonly value: string) {}

  /**
   * Validates an already-canonical slug. Strict on purpose: normalizing silently
   * would let two callers believe they produced the same route.
   */
  static of(raw: string): ProjectSlug {
    if (typeof raw !== 'string') {
      throw new DomainError('ProjectSlug must be a string');
    }

    if (raw.length === 0) {
      throw new DomainError('ProjectSlug must not be empty');
    }

    if (!CANONICAL_FORM.test(raw)) {
      throw new DomainError(
        'ProjectSlug must be lowercase kebab-case (a-z, 0-9, single hyphens)',
      );
    }

    if (raw.length > MAX_LENGTH) {
      throw new DomainError(
        `ProjectSlug must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new ProjectSlug(raw);
  }

  /**
   * Derives a canonical slug from a title: decompose, drop diacritics,
   * lowercase, collapse every run of non-alphanumeric characters into a single
   * hyphen, then trim leading and trailing hyphens.
   *
   * The result can never exceed `ProjectTitle`'s own bound (every run of
   * characters maps to at most one hyphen), so it needs no length check here.
   */
  static fromTitle(title: ProjectTitle): ProjectSlug {
    const candidate = title.value
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (candidate.length === 0) {
      throw new DomainError(
        'ProjectSlug cannot be derived from the given title',
      );
    }

    return new ProjectSlug(candidate);
  }

  equals(other: ProjectSlug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
