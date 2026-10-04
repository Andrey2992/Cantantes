import { DomainError } from '../errors/DomainError.js';

const MAX_LENGTH = 80;
// Unicode "Other" category: control characters (including CR/LF and TAB) plus
// format characters such as zero-width joiners.
const FORBIDDEN_CHARACTERS = /\p{C}/u;

/**
 * Display name of a Project.
 *
 * Justified by the Stitch PRD: the title is rendered as a single line of the
 * typographic index (section 3.2) and again inside the contextual
 * `VIEW ARTIST: <TITLE>` badge (section 3.5). A title containing line breaks or
 * control characters would break that layout and produce a misleading accessible
 * name, so normalization and limits live in the domain instead of in a template.
 *
 * Normalization: trimmed, and internal whitespace runs collapsed to one space.
 * Original casing and punctuation are preserved because the brief relies on
 * display styling (`A$AP ROCKY.`, `BAD BUNNY.`).
 */
export class ProjectTitle {
  private constructor(readonly value: string) {}

  static of(raw: string): ProjectTitle {
    if (typeof raw !== 'string') {
      throw new DomainError('ProjectTitle must be a string');
    }

    if (FORBIDDEN_CHARACTERS.test(raw)) {
      throw new DomainError('ProjectTitle must not contain control characters');
    }

    const value = raw.trim().replace(/\s+/gu, ' ');

    if (value.length === 0) {
      throw new DomainError('ProjectTitle must not be empty');
    }

    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `ProjectTitle must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new ProjectTitle(value);
  }

  equals(other: ProjectTitle): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
