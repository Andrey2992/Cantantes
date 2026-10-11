import { DomainError } from '../errors/DomainError.js';

/**
 * EN: Parameters that every short-text field must supply so the error messages
 * can name the offending field and so the length bound can vary per field.
 *
 * ES: Parámetros que todo campo de texto corto debe aportar para que los
 * mensajes de error nombren el campo infractor y para poder variar el límite de
 * longitud por campo.
 */
export type ShortTextOptions = {
  /** EN: Human-readable field name used in error messages. / ES: Nombre legible del campo usado en los mensajes de error. */
  readonly field: string;
  /** EN: Maximum number of characters after normalization. / ES: Número máximo de caracteres tras la normalización. */
  readonly maxLength: number;
};

// Unicode "Other" category: control characters (including CR/LF and TAB) plus
// format characters such as zero-width joiners. A short single-line label must
// not contain any of them.
// Categoría Unicode "Other": caracteres de control (incluidos CR/LF y TAB) más
// caracteres de formato como los zero-width joiner. Una etiqueta corta de una
// sola línea no debe contener ninguno.
const FORBIDDEN_CHARACTERS = /\p{C}/u;

/**
 * EN: A normalized, single-line, bounded text value (company names, roles, skill
 * names, categories, contact names).
 *
 * It is the shared vocabulary for "short label" fields across the Experience,
 * Skill and Contact domains. Existing them here avoids five near-identical value
 * objects while still enforcing one real invariant set:
 * - trimmed, with internal whitespace runs collapsed to a single space;
 * - no control characters, so a value can never break a single-line layout or
 *   smuggle a line break into a stored label;
 * - non-empty and bounded by {@link ShortTextOptions.maxLength}.
 *
 * Original casing and punctuation are preserved because they are meaningful
 * (for example "C++", "Node.js").
 *
 * ES: Un valor de texto normalizado, de una sola línea y acotado (nombres de
 * empresa, roles, nombres de habilidades, categorías, nombres de contacto).
 *
 * Es el vocabulario compartido para campos de "etiqueta corta" en los dominios
 * Experience, Skill y Contact. Definirlos aquí evita cinco value objects casi
 * idénticos mientras se aplica un conjunto de invariantes real:
 * - recortado, con las secuencias internas de espacios colapsadas a un solo
 *   espacio;
 * - sin caracteres de control, para que un valor nunca rompa un diseño de una
 *   sola línea ni introduzca un salto de línea en una etiqueta almacenada;
 * - no vacío y acotado por {@link ShortTextOptions.maxLength}.
 *
 * Se conservan las mayúsculas y la puntuación originales porque son
 * significativas (por ejemplo "C++", "Node.js").
 */
export class ShortText {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates and normalizes a raw short-text value.
   * @param raw Candidate value. Must be a string.
   * @param options Field name and maximum length, see {@link ShortTextOptions}.
   * @returns A normalized `ShortText`.
   * @throws {DomainError} If the value is not a string, contains control
   * characters, is empty after trimming, or exceeds the bound.
   *
   * ES: Valida y normaliza un valor de texto corto crudo.
   * @param raw Valor candidato. Debe ser una cadena.
   * @param options Nombre del campo y longitud máxima, ver {@link ShortTextOptions}.
   * @returns Un `ShortText` normalizado.
   * @throws {DomainError} Si el valor no es una cadena, contiene caracteres de
   * control, queda vacío tras recortar o supera el límite.
   */
  static of(raw: string, options: ShortTextOptions): ShortText {
    const { field, maxLength } = options;

    if (typeof raw !== 'string') {
      throw new DomainError(`${field} must be a string`);
    }

    if (FORBIDDEN_CHARACTERS.test(raw)) {
      throw new DomainError(`${field} must not contain control characters`);
    }

    const value = raw.trim().replace(/\s+/gu, ' ');

    if (value.length === 0) {
      throw new DomainError(`${field} must not be empty`);
    }

    if (value.length > maxLength) {
      throw new DomainError(`${field} must be at most ${maxLength} characters`);
    }

    return new ShortText(value);
  }

  /** EN: Value equality. / ES: Igualdad por valor. */
  equals(other: ShortText): boolean {
    return this.value === other.value;
  }

  /** EN: Serializable form. / ES: Forma serializable. */
  toString(): string {
    return this.value;
  }
}
