import type { SkillListResponse } from '@cantantes/types';
import { apiFetch, type ApiRequestOptions } from './client';
import { expectArrayOf, isSkillResponse } from './guards';

/**
 * EN: Skill resource of the API integration layer.
 *
 * Read-only. The API already groups skills by category and then by name, so this
 * module preserves the received order and adds nothing.
 *
 * ES: Recurso Skill de la capa de integración de API.
 *
 * Solo lectura. La API ya agrupa las habilidades por categoría y luego por
 * nombre, así que este módulo conserva el orden recibido y no añade nada.
 */

/**
 * EN: Fetches every stored skill.
 *
 * @param options Optional request options.
 * @returns The skills in API order; an empty table is an empty array. No
 * certifications or qualifications are invented.
 * @throws {ApiError} On a non-2xx status.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When the body is not a well-formed skill array.
 *
 * ES: Obtiene todas las habilidades almacenadas.
 *
 * @param options Opciones de petición opcionales.
 * @returns Las habilidades en el orden de la API; una tabla vacía es un arreglo
 * vacío. No se inventan certificaciones ni titulaciones.
 * @throws {ApiError} Con un estado distinto de 2xx.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando el cuerpo no es un arreglo de habilidades bien formado.
 */
export async function listSkills(
  options?: ApiRequestOptions,
): Promise<SkillListResponse> {
  const data = await apiFetch<unknown>('/api/v1/skills', options);

  return expectArrayOf(data, isSkillResponse, 'skills');
}
