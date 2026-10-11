import type {
  ApiErrorResponse,
  ContactReceivedResponse,
  ExperienceResponse,
  HealthResponse,
  ProjectResponse,
  SkillResponse,
} from '@cantantes/types';
import { ApiParseError } from './errors';

/**
 * EN: Runtime shape guards for the API contracts.
 *
 * TypeScript types vanish at runtime, so a malformed or unexpected body would
 * otherwise flow into the UI as a lie (for example an object where an array was
 * expected). These guards check the exact fields the frontend reads and turn a
 * contract mismatch into an explicit {@link ApiParseError}.
 *
 * The checks stop at shape: they never duplicate business rules, which stay in
 * the backend domain.
 *
 * ES: Guardas de forma en runtime para los contratos de la API.
 *
 * Los tipos de TypeScript desaparecen en runtime, así que un cuerpo malformado o
 * inesperado llegaría a la interfaz como una mentira (por ejemplo un objeto donde
 * se esperaba un arreglo). Estas guardas revisan los campos exactos que el
 * frontend lee y convierten un desajuste de contrato en un {@link ApiParseError}
 * explícito.
 *
 * Las comprobaciones se detienen en la forma: nunca duplican reglas de negocio,
 * que permanecen en el dominio del backend.
 */

/** EN: True for a plain object (not null, not an array). / ES: Verdadero para un objeto simple (ni null ni arreglo). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** EN: True for a non-empty string. / ES: Verdadero para una cadena no vacía. */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/** EN: True for a string or `null`. / ES: Verdadero para una cadena o `null`. */
function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

/** EN: Narrows an unknown value to {@link ApiErrorResponse}. / ES: Restringe un valor desconocido a {@link ApiErrorResponse}. */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    typeof value.statusCode === 'number' &&
    typeof value.error === 'string' &&
    typeof value.message === 'string'
  );
}

/** EN: Narrows an unknown value to {@link ProjectResponse}. / ES: Restringe un valor desconocido a {@link ProjectResponse}. */
export function isProjectResponse(value: unknown): value is ProjectResponse {
  if (!isRecord(value)) {
    return false;
  }

  const { theme } = value;

  if (!isRecord(theme)) {
    return false;
  }

  return (
    isNonEmptyString(value.slug) &&
    isNonEmptyString(value.title) &&
    typeof theme.from === 'string' &&
    typeof theme.to === 'string' &&
    typeof theme.accent === 'string'
  );
}

/**
 * EN: Narrows an unknown value to {@link ExperienceResponse}.
 *
 * `summary` and `endDate` are nullable by contract, so `null` is accepted while
 * any other non-string value is rejected.
 *
 * ES: Restringe un valor desconocido a {@link ExperienceResponse}.
 *
 * `summary` y `endDate` son anulables por contrato, así que se acepta `null`
 * mientras que cualquier otro valor que no sea cadena se rechaza.
 */
export function isExperienceResponse(
  value: unknown,
): value is ExperienceResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.company) &&
    isNonEmptyString(value.role) &&
    isNullableString(value.summary) &&
    isNonEmptyString(value.startDate) &&
    isNullableString(value.endDate)
  );
}

/** EN: Narrows an unknown value to {@link SkillResponse}. / ES: Restringe un valor desconocido a {@link SkillResponse}. */
export function isSkillResponse(value: unknown): value is SkillResponse {
  return (
    isRecord(value) &&
    isNonEmptyString(value.name) &&
    isNullableString(value.category)
  );
}

/** EN: Narrows an unknown value to {@link ContactReceivedResponse}. / ES: Restringe un valor desconocido a {@link ContactReceivedResponse}. */
export function isContactReceivedResponse(
  value: unknown,
): value is ContactReceivedResponse {
  return isRecord(value) && value.status === 'received';
}

/** EN: Narrows an unknown value to {@link HealthResponse}. / ES: Restringe un valor desconocido a {@link HealthResponse}. */
export function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    isRecord(value) &&
    (value.status === 'ok' || value.status === 'degraded') &&
    (value.database === 'up' || value.database === 'down')
  );
}

/**
 * EN: Validates that an API body is an array whose every element matches a guard.
 *
 * @param data Unknown parsed body.
 * @param guard Element guard, one of the contract guards above.
 * @param resource Human-readable resource name used in the error message.
 * @param status HTTP status the malformed body arrived with (defaults to 200).
 * @returns The same array, narrowed to `T[]`.
 * @throws {ApiParseError} When the value is not an array or an element is
 * malformed.
 *
 * ES: Valida que un cuerpo de la API sea un arreglo cuyos elementos cumplan una
 * guarda.
 *
 * @param data Cuerpo parseado desconocido.
 * @param guard Guarda de elemento, una de las guardas de contrato de arriba.
 * @param resource Nombre legible del recurso usado en el mensaje de error.
 * @param status Estado HTTP con el que llegó el cuerpo malformado (por defecto 200).
 * @returns El mismo arreglo, restringido a `T[]`.
 * @throws {ApiParseError} Cuando el valor no es un arreglo o un elemento está
 * malformado.
 */
export function expectArrayOf<T>(
  data: unknown,
  guard: (value: unknown) => value is T,
  resource: string,
  status = 200,
): T[] {
  if (!Array.isArray(data) || !data.every(guard)) {
    throw new ApiParseError(
      status,
      `Malformed ${resource} response from the API.`,
    );
  }

  return data;
}
