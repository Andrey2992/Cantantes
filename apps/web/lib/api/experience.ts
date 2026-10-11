import type { ExperienceListResponse } from '@cantantes/types';
import { apiFetch, type ApiRequestOptions } from './client';
import { expectArrayOf, isExperienceResponse } from './guards';

/**
 * EN: Experience resource of the API integration layer.
 *
 * Read-only: wraps `GET /api/v1/experience` and validates the body against the
 * shared contract. The order (newest start date first) is a backend decision and
 * is preserved as received; no sorting or inventing happens here.
 *
 * ES: Recurso Experience de la capa de integración de API.
 *
 * Solo lectura: envuelve `GET /api/v1/experience` y valida el cuerpo contra el
 * contrato compartido. El orden (fecha de inicio más reciente primero) es una
 * decisión del backend y se conserva tal como llega; aquí no se ordena ni se
 * inventa nada.
 */

/**
 * EN: Fetches every stored experience record.
 *
 * @param options Optional request options.
 * @returns The records in API order; an empty table is an empty array. No demo
 * data is fabricated when the table is empty.
 * @throws {ApiError} On a non-2xx status.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When the body is not a well-formed experience array.
 *
 * ES: Obtiene todos los registros de experiencia almacenados.
 *
 * @param options Opciones de petición opcionales.
 * @returns Los registros en el orden de la API; una tabla vacía es un arreglo
 * vacío. No se fabrican datos de demostración cuando la tabla está vacía.
 * @throws {ApiError} Con un estado distinto de 2xx.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando el cuerpo no es un arreglo de experiencia bien formado.
 */
export async function listExperience(
  options?: ApiRequestOptions,
): Promise<ExperienceListResponse> {
  const data = await apiFetch<unknown>('/api/v1/experience', options);

  return expectArrayOf(data, isExperienceResponse, 'experience');
}
