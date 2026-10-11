import type { ProjectListResponse, ProjectResponse } from '@cantantes/types';
import { apiFetch, type ApiRequestOptions } from './client';
import { ApiError, ApiParseError } from './errors';
import { expectArrayOf, isProjectResponse } from './guards';

/**
 * EN: Project resource of the API integration layer.
 *
 * Wraps the two read endpoints of the Project context and validates their bodies
 * against the shared contracts. Presentation stays out of this file: it returns
 * domain-shaped data and lets the caller render it however the Stitch design
 * requires.
 *
 * ES: Recurso Project de la capa de integración de API.
 *
 * Envuelve los dos endpoints de lectura del contexto Project y valida sus cuerpos
 * contra los contratos compartidos. La presentación queda fuera de este archivo:
 * devuelve datos con forma de dominio y deja que el llamador los renderice como el
 * diseño de Stitch lo requiera.
 */

/**
 * EN: Fetches the full project roster.
 *
 * @param options Optional request options (signal, cache, test overrides).
 * @returns The projects in the order the API returns them. An empty table is an
 * empty array, never an error.
 * @throws {ApiError} On a non-2xx status.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When the body is not a well-formed project array.
 *
 * ES: Obtiene el listado completo de proyectos.
 *
 * @param options Opciones de petición opcionales (señal, caché, anulaciones de prueba).
 * @returns Los proyectos en el orden que devuelve la API. Una tabla vacía es un
 * arreglo vacío, nunca un error.
 * @throws {ApiError} Con un estado distinto de 2xx.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando el cuerpo no es un arreglo de proyectos bien formado.
 */
export async function listProjects(
  options?: ApiRequestOptions,
): Promise<ProjectListResponse> {
  const data = await apiFetch<unknown>('/api/v1/projects', options);

  return expectArrayOf(data, isProjectResponse, 'projects');
}

/**
 * EN: Fetches one project by its canonical slug.
 *
 * A `404` (unknown project) and a `400` (non-canonical slug) both mean "there is
 * no such project", so both return `null`; the caller can then render a
 * not-found state without turning a normal miss into a crash. Every other status
 * still throws.
 *
 * @param slug Canonical project slug, typically from the route params.
 * @param options Optional request options.
 * @returns The matching project, or `null` when it does not exist.
 * @throws {ApiError} On any non-2xx status other than `400`/`404`.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When a `200` body is not a well-formed project.
 *
 * ES: Obtiene un proyecto por su slug canónico.
 *
 * Un `404` (proyecto desconocido) y un `400` (slug no canónico) significan ambos
 * "no existe tal proyecto", así que ambos devuelven `null`; el llamador puede
 * renderizar un estado de no encontrado sin convertir un fallo normal en una
 * caída. Cualquier otro estado sí lanza.
 *
 * @param slug Slug canónico del proyecto, normalmente de los parámetros de ruta.
 * @param options Opciones de petición opcionales.
 * @returns El proyecto coincidente, o `null` cuando no existe.
 * @throws {ApiError} Con cualquier estado distinto de 2xx salvo `400`/`404`.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando un cuerpo `200` no es un proyecto bien formado.
 */
export async function getProjectBySlug(
  slug: string,
  options?: ApiRequestOptions,
): Promise<ProjectResponse | null> {
  try {
    const data = await apiFetch<unknown>(
      `/api/v1/projects/${encodeURIComponent(slug)}`,
      options,
    );

    if (!isProjectResponse(data)) {
      throw new ApiParseError(
        200,
        'Malformed project response from the API.',
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 404)) {
      return null;
    }

    throw error;
  }
}
