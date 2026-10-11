import type { HealthResponse } from '@cantantes/types';
import {
  apiRequest,
  type ApiRequestOptions,
} from './client';
import { ApiError, ApiParseError } from './errors';
import { isApiErrorResponse, isHealthResponse } from './guards';

/**
 * EN: Health resource of the API integration layer.
 *
 * Useful in development to confirm that the web app can reach the API and that
 * the API can reach PostgreSQL. It is intentionally version-neutral
 * (`GET /api/health`, no `/v1`).
 *
 * ES: Recurso Health de la capa de integración de API.
 *
 * Útil en desarrollo para confirmar que la web puede alcanzar la API y que la API
 * puede alcanzar PostgreSQL. Es intencionalmente neutro en versión
 * (`GET /api/health`, sin `/v1`).
 */

/** EN: Statuses that carry a {@link HealthResponse} instead of an error. / ES: Estados que llevan un {@link HealthResponse} en lugar de un error. */
const HEALTH_STATUSES = new Set([200, 503]);

/**
 * EN: Probes the API health endpoint.
 *
 * `503` is a **valid** answer here (the API is up but the database is down), so
 * only unexpected statuses, unreachable hosts and malformed bodies throw.
 *
 * @param options Optional request options.
 * @returns The health report, including the degraded case.
 * @throws {ApiError} On a status other than `200`/`503`.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When the body is not a well-formed health report.
 *
 * ES: Sondea el endpoint de salud de la API.
 *
 * `503` es una respuesta **válida** aquí (la API está arriba pero la base de datos
 * caída), así que solo lanzan los estados inesperados, los hosts inalcanzables y
 * los cuerpos malformados.
 *
 * @param options Opciones de petición opcionales.
 * @returns El reporte de salud, incluido el caso degradado.
 * @throws {ApiError} Con un estado distinto de `200`/`503`.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando el cuerpo no es un reporte de salud bien formado.
 */
export async function getHealth(
  options?: ApiRequestOptions,
): Promise<HealthResponse> {
  const { status, data } = await apiRequest<unknown>('/api/health', options);

  if (!HEALTH_STATUSES.has(status)) {
    const body = isApiErrorResponse(data) ? data : null;

    throw new ApiError(
      status,
      body,
      body?.message ?? `The health endpoint answered with status ${status}.`,
    );
  }

  if (!isHealthResponse(data)) {
    throw new ApiParseError(
      status,
      'Malformed health response from the API.',
    );
  }

  return data;
}
