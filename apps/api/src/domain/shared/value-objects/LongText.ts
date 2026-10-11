import { DomainError } from '../errors/DomainError.js';

/**
 * EN: Parameters that every long-text field must supply, mirroring
 * {@link ShortTextOptions} so error messages and bounds stay explicit.
 *
 * ES: Parámetros que todo campo de texto largo debe aportar, análogos a
 * {@link ShortTextOptions} para que los mensajes de error y los límites sigan
 * siendo explícitos.
 */
export type LongTextOptions = {
  /** EN: Human-readable field name used in error messages. / ES: Nombre legible del campo usado en los mensajes de error. */
  readonly field: string;
  /** EN: Maximum number of characters after trimming. / ES: Número máximo de caracteres tras recortar. */
  readonly maxLength: number;
};

// Characters that a multi-line body may contain. Everything else in the Unicode
// "Other" category (control, format, unassigned...) is rejected.
// Caracteres que un cuerpo multilínea sí puede contener. Todo lo demás de la
// categoría Unicode "Other" (control, formato, no asignados...) se rechaza.
const ALLOWED_CONTROL_CHARACTERS = /[\n\t]/gu;

/**
 * EN: A normalized, multi-line, bounded text value (experience summaries and
 * contact messages).
 *
 * Unlike {@link ShortText} it is meant for prose, so newlines and tabs are
 * allowed. Everything else in the Unicode "Other" category is still rejected so
 * a stored body cannot carry stray control bytes. Outer whitespace is trimmed;
 * internal spacing, line breaks and punctuation are preserved because they are
 * part of the author's message.
 *
 * ES: Un valor de texto normalizado, multilínea y acotado (resúmenes de
 * experiencia y mensajes de contacto).
 *
 * A diferencia de {@link ShortText}, está pensado para prosa, por lo que se
 * permiten saltos de línea y tabulaciones. El resto de la categoría Unicode
 * "Other" se rechaza para que un cuerpo almacenado no arrastre bytes de control.
 * Se recortan los espacios exteriores; el espaciado interno, los saltos de línea
 * y la puntuación se conservan porque forman parte del mensaje del autor.
 */
export class LongText {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates and normalizes a raw long-text value.
   * @param raw Candidate value. Must be a string.
   * @param options Field name and maximum length, see {@link LongTextOptions}.
   * @returns A normalized `LongText`.
   * @throws {DomainError} If the value is not a string, contains a forbidden
   * control character, is empty after trimming, or exceeds the bound.
   *
   * ES: Valida y normaliza un valor de texto largo crudo.
   * @param raw Valor candidato. Debe ser una cadena.
   * @param options Nombre del campo y longitud máxima, ver {@link LongTextOptions}.
   * @returns Un `LongText` normalizado.
   * @throws {DomainError} Si el valor no es una cadena, contiene un carácter de
   * control prohibido, queda vacío tras recortar o supera el límite.
   */
  static of(raw: string, options: LongTextOptions): LongText {
    const { field, maxLength } = options;

    if (typeof raw !== 'string') {
      throw new DomainError(`${field} must be a string`);
    }

    const withoutAllowed = raw.replace(ALLOWED_CONTROL_CHARACTERS, '');

    if (/\p{C}/u.test(withoutAllowed)) {
      throw new DomainError(`${field} must not contain control characters`);
    }

    const value = raw.trim();

    if (value.length === 0) {
      throw new DomainError(`${field} must not be empty`);
    }

    if (value.length > maxLength) {
      throw new DomainError(`${field} must be at most ${maxLength} characters`);
    }

    return new LongText(value);
  }

  /** EN: Value equality. / ES: Igualdad por valor. */
  equals(other: LongText): boolean {
    return this.value === other.value;
  }

  /** EN: Serializable form. / ES: Forma serializable. */
  toString(): string {
    return this.value;
  }
}
