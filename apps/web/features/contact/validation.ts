import type { ContactMessageInput } from '../../lib/api';
import type { ContactFieldErrors } from './types';

/**
 * EN: Client-side validation of the contact form.
 *
 * It mirrors the invariants the backend enforces in `ShortText`, `EmailAddress`
 * and `LongText` (`apps/api/src/domain/shared/value-objects`) so users get
 * immediate feedback and the API rarely has to reject a submission. The mirror is
 * intentional and narrow: if the backend bounds change, the constants here must
 * change with them.
 *
 * It is a pure module (no React, no fetch) so it is trivial to unit test.
 *
 * ES: Validación del lado del cliente del formulario de contacto.
 *
 * Refleja las invariantes que el backend aplica en `ShortText`, `EmailAddress` y
 * `LongText` (`apps/api/src/domain/shared/value-objects`) para dar
 * retroalimentación inmediata y que la API casi nunca tenga que rechazar un envío.
 * El reflejo es intencional y acotado: si los límites del backend cambian, las
 * constantes de aquí deben cambiar con ellos.
 *
 * Es un módulo puro (sin React, sin fetch), por lo que es trivial de probar por
 * unidad.
 */

/** EN: Mirror of the backend name bound. / ES: Reflejo del límite del nombre en el backend. */
export const CONTACT_NAME_MAX_LENGTH = 120;
/** EN: Mirror of the backend message bound. / ES: Reflejo del límite del mensaje en el backend. */
export const CONTACT_MESSAGE_MAX_LENGTH = 4000;
/** EN: Mirror of the RFC 5321 address bound. / ES: Reflejo del límite de dirección de la RFC 5321. */
export const CONTACT_EMAIL_MAX_LENGTH = 254;
/** EN: Mirror of the RFC 5321 local-part bound. / ES: Reflejo del límite de la parte local de la RFC 5321. */
export const CONTACT_EMAIL_LOCAL_MAX_LENGTH = 64;

// Same pragmatic addresses rule as the backend: one `@`, a dot in the domain, no
// whitespace.
// La misma regla pragmática de direcciones que el backend: una `@`, un punto en
// el dominio, sin espacios.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Unicode "Other" category: control (CR/LF/TAB) and format characters. A short
// single-line label must not contain any of them.
// Categoría Unicode "Other": caracteres de control (CR/LF/TAB) y de formato. Una
// etiqueta corta de una sola línea no debe contener ninguno.
const FORBIDDEN_CHARACTERS = /\p{C}/u;

// Newlines and tabs are the only control characters a prose message may contain.
// Los saltos de línea y tabulaciones son los únicos caracteres de control que un
// mensaje en prosa puede contener.
const ALLOWED_CONTROL_CHARACTERS = /[\n\t]/gu;

/** EN: Outcome of validating a single field. / ES: Resultado de validar un solo campo. */
type FieldResult =
  | { readonly value: string }
  | { readonly error: NonNullable<ContactFieldErrors[keyof ContactFieldErrors]> };

/** EN: Outcome of validating the whole form. / ES: Resultado de validar todo el formulario. */
export type ContactValidationResult =
  | { readonly ok: true; readonly value: ContactMessageInput }
  | { readonly ok: false; readonly errors: ContactFieldErrors };

/**
 * EN: Validates and normalizes the raw contact fields.
 *
 * @param raw Field values as they came from the form; anything may be `null`.
 * @returns A discriminated result: normalized values, or per-field error codes.
 *
 * ES: Valida y normaliza los campos crudos de contacto.
 *
 * @param raw Valores de los campos tal como llegaron del formulario; cualquiera
 * puede ser `null`.
 * @returns Un resultado discriminado: valores normalizados, o códigos de error por
 * campo.
 */
export function validateContactFields(raw: {
  readonly name: unknown;
  readonly email: unknown;
  readonly message: unknown;
}): ContactValidationResult {
  const name = validateName(raw.name);
  const email = validateEmail(raw.email);
  const message = validateMessage(raw.message);

  // `in` narrowing lets TypeScript see that the three results are value results
  // after this early return, so no casts are needed below.
  if ('error' in name || 'error' in email || 'error' in message) {
    const errors: ContactFieldErrors = {};

    if ('error' in name) {
      errors.name = name.error;
    }

    if ('error' in email) {
      errors.email = email.error;
    }

    if ('error' in message) {
      errors.message = message.error;
    }

    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name: name.value,
      email: email.value,
      message: message.value,
    },
  };
}

/**
 * EN: Validates a name like the backend `ShortText` does (trim, collapse internal
 * whitespace, reject control characters, bound the length).
 *
 * ES: Valida un nombre como lo hace el `ShortText` del backend (recortar, colapsar
 * espacios internos, rechazar caracteres de control, acotar la longitud).
 */
function validateName(raw: unknown): FieldResult {
  if (typeof raw !== 'string') {
    return { error: 'required' };
  }

  if (FORBIDDEN_CHARACTERS.test(raw)) {
    return { error: 'invalid-characters' };
  }

  const value = raw.trim().replace(/\s+/gu, ' ');

  if (value.length === 0) {
    return { error: 'required' };
  }

  if (value.length > CONTACT_NAME_MAX_LENGTH) {
    return { error: 'too-long' };
  }

  return { value };
}

/**
 * EN: Validates an email like the backend `EmailAddress` does (trim, lowercase,
 * pragmatic format, RFC length bounds).
 *
 * ES: Valida un correo como lo hace el `EmailAddress` del backend (recortar,
 * minúsculas, formato pragmático, límites de longitud de la RFC).
 */
function validateEmail(raw: unknown): FieldResult {
  if (typeof raw !== 'string') {
    return { error: 'required' };
  }

  const value = raw.trim().toLowerCase();

  if (value.length === 0) {
    return { error: 'required' };
  }

  if (!EMAIL_PATTERN.test(value)) {
    return { error: 'invalid-format' };
  }

  if (value.length > CONTACT_EMAIL_MAX_LENGTH) {
    return { error: 'too-long' };
  }

  const localPart = value.slice(0, value.indexOf('@'));

  if (localPart.length > CONTACT_EMAIL_LOCAL_MAX_LENGTH) {
    return { error: 'too-long' };
  }

  return { value };
}

/**
 * EN: Validates a message like the backend `LongText` does (allow newlines/tabs,
 * reject other control characters, trim, bound the length).
 *
 * ES: Valida un mensaje como lo hace el `LongText` del backend (permitir saltos de
 * línea/tabulaciones, rechazar otros caracteres de control, recortar, acotar la
 * longitud).
 */
function validateMessage(raw: unknown): FieldResult {
  if (typeof raw !== 'string') {
    return { error: 'required' };
  }

  const withoutAllowed = raw.replace(ALLOWED_CONTROL_CHARACTERS, '');

  if (FORBIDDEN_CHARACTERS.test(withoutAllowed)) {
    return { error: 'invalid-characters' };
  }

  const value = raw.trim();

  if (value.length === 0) {
    return { error: 'required' };
  }

  if (value.length > CONTACT_MESSAGE_MAX_LENGTH) {
    return { error: 'too-long' };
  }

  return { value };
}
