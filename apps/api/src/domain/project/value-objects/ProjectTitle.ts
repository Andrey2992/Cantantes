import { DomainError } from '../../shared/errors/DomainError.js';

const MAX_LENGTH = 80;
// Unicode "Other" category: control characters (including CR/LF and TAB) plus
// format characters such as zero-width joiners.
const FORBIDDEN_CHARACTERS = /\p{C}/u;

/**
 * EN: Display name of a Project.
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
 *
 * ES: Nombre visible de un Project.
 *
 * Justificado por el Stitch PRD: el título se renderiza como una sola línea del
 * índice tipográfico (sección 3.2) y otra vez dentro del badge contextual
 * `VIEW ARTIST: <TITLE>` (sección 3.5). Un título con saltos de línea o
 * caracteres de control rompería ese diseño y produciría un nombre accesible
 * engañoso, así que la normalización y los límites viven en el dominio en lugar de
 * en una plantilla.
 *
 * Normalización: recortado, y las secuencias internas de espacios colapsadas a un
 * solo espacio. Se conservan las mayúsculas y la puntuación originales porque el
 * brief se apoya en el estilo de presentación (`A$AP ROCKY.`, `BAD BUNNY.`).
 */
export class ProjectTitle {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates and normalizes a raw title.
   * @param raw Candidate title. Trimmed and whitespace-collapsed.
   * @returns A normalized `ProjectTitle`.
   * @throws {DomainError} If it is not a string, contains control characters, is
   * empty, or exceeds the bound.
   *
   * ES: Valida y normaliza un título crudo.
   * @param raw Título candidato. Se recorta y se colapsan los espacios.
   * @returns Un `ProjectTitle` normalizado.
   * @throws {DomainError} Si no es una cadena, contiene caracteres de control, está
   * vacío o supera el límite.
   */
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
