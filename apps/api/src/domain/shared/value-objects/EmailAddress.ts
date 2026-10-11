import { DomainError } from '../errors/DomainError.js';

/** EN: RFC 5321 overall address length limit. / ES: Límite total de longitud de dirección de la RFC 5321. */
const MAX_LENGTH = 254;
/** EN: RFC 5321 local-part length limit. / ES: Límite de longitud de la parte local de la RFC 5321. */
const MAX_LOCAL_LENGTH = 64;

// Pragmatic pattern, not a full RFC 5322 grammar: one `@`, at least one dot in
// the domain, and no whitespace. It rejects the mistakes users actually make
// (missing `@`, missing domain, trailing spaces) without pretending to validate
// deliverability, which only a real mail server can do.
// Patrón pragmático, no la gramática completa de la RFC 5322: una `@`, al menos
// un punto en el dominio y sin espacios. Rechaza los errores que la gente comete
// de verdad (falta la `@`, falta el dominio, espacios finales) sin pretender
// validar la entregabilidad, que solo un servidor de correo real puede hacer.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * EN: A validated and normalized email address (the Contact domain).
 *
 * This is the one field of a contact message worth its own value object: it has a
 * real format invariant and a canonical representation. It is normalized to
 * lowercase so that the same mailbox cannot be stored or compared under two
 * casings; the domain does not send emails, it only guarantees the stored address
 * is well-formed (AGENTS.md section 8).
 *
 * ES: Una dirección de correo validada y normalizada (dominio Contact).
 *
 * Es el único campo de un mensaje de contacto que merece su propio value object:
 * tiene una invariante de formato real y una representación canónica. Se
 * normaliza a minúsculas para que el mismo buzón no se almacene ni se compare con
 * dos capitalizaciones distintas; el dominio no envía correos, solo garantiza que
 * la dirección almacenada está bien formada (AGENTS.md sección 8).
 */
export class EmailAddress {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates and normalizes a raw email address.
   * @param raw Candidate address. Trimmed and lowercased before validation.
   * @returns A canonical lowercase `EmailAddress`.
   * @throws {DomainError} If it is not a string, is not shaped like an email,
   * or exceeds the length bounds.
   *
   * ES: Valida y normaliza una dirección de correo cruda.
   * @param raw Dirección candidata. Se recorta y se pasa a minúsculas antes de
   * validar.
   * @returns Un `EmailAddress` canónico en minúsculas.
   * @throws {DomainError} Si no es una cadena, no tiene forma de correo o supera
   * los límites de longitud.
   */
  static of(raw: string): EmailAddress {
    if (typeof raw !== 'string') {
      throw new DomainError('Email address must be a string');
    }

    const value = raw.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(value)) {
      throw new DomainError('Email address is not valid');
    }

    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `Email address must be at most ${MAX_LENGTH} characters`,
      );
    }

    const localPart = value.slice(0, value.indexOf('@'));

    if (localPart.length > MAX_LOCAL_LENGTH) {
      throw new DomainError(
        `Email address local part must be at most ${MAX_LOCAL_LENGTH} characters`,
      );
    }

    return new EmailAddress(value);
  }

  /** EN: Value equality. / ES: Igualdad por valor. */
  equals(other: EmailAddress): boolean {
    return this.value === other.value;
  }

  /** EN: Serializable form. / ES: Forma serializable. */
  toString(): string {
    return this.value;
  }
}
