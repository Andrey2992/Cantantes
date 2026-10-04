import { DomainError } from '../errors/DomainError.js';

const MAX_LENGTH = 64;

/**
 * Opaque identity of a Project.
 *
 * The domain treats the identifier as an opaque string: it never parses it,
 * never derives meaning from it, and never generates it. Whoever persists a
 * project decides how the identifier is produced (AGENTS.md section 8: the
 * domain owns invariants, infrastructure owns storage concerns).
 *
 * Rule enforced: an identifier is a single, non-empty, bounded token. An empty
 * or whitespace-bearing identifier would make repository lookups silently miss
 * instead of failing loudly.
 */
export class ProjectId {
  private constructor(readonly value: string) {}

  static of(raw: string): ProjectId {
    if (typeof raw !== 'string') {
      throw new DomainError('ProjectId must be a string');
    }

    const value = raw.trim();

    if (value.length === 0) {
      throw new DomainError('ProjectId must not be empty');
    }

    if (/\s/.test(value)) {
      throw new DomainError('ProjectId must not contain whitespace');
    }

    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `ProjectId must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new ProjectId(value);
  }

  equals(other: ProjectId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
