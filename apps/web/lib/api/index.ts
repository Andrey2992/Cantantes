/**
 * EN: Public entry point of the frontend API integration layer.
 *
 * Import everything API-related from `@/lib/api` (or a relative `lib/api`) so the
 * transport details stay behind one boundary. This module is **server-only**: it
 * reads `API_BASE_URL` and must not be imported from a Client Component.
 *
 * Layers inside the module:
 * - `config` — the single source of truth for the backend base URL.
 * - `client` — typed JSON transport and failure normalization.
 * - `errors` — `ApiError`, `ApiNetworkError`, `ApiParseError`, `ApiConfigError`.
 * - `guards` — runtime validation of response shapes.
 * - one file per API resource (`projects`, `experience`, `skills`, `contact`,
 *   `health`).
 *
 * ES: Punto de entrada público de la capa de integración de API del frontend.
 *
 * Importa todo lo relacionado con la API desde `@/lib/api` (o un `lib/api`
 * relativo) para que los detalles de transporte queden tras un solo límite. Este
 * módulo es **solo para el servidor**: lee `API_BASE_URL` y no debe importarse
 * desde un Client Component.
 *
 * Capas dentro del módulo:
 * - `config` — la única fuente de verdad de la URL base del backend.
 * - `client` — transporte JSON tipado y normalización de fallos.
 * - `errors` — `ApiError`, `ApiNetworkError`, `ApiParseError`, `ApiConfigError`.
 * - `guards` — validación de formas de respuesta en runtime.
 * - un archivo por recurso de la API (`projects`, `experience`, `skills`,
 *   `contact`, `health`).
 */

export {
  API_BASE_URL_ENV_VAR,
  assertServerRuntime,
  resolveApiBaseUrl,
} from './config';

export {
  apiFetch,
  apiRequest,
  type ApiRequestOptions,
  type ApiResult,
} from './client';

export {
  ApiConfigError,
  ApiError,
  ApiNetworkError,
  ApiParseError,
  isApiConfigError,
  isApiError,
  isApiNetworkError,
  isApiParseError,
} from './errors';

export {
  expectArrayOf,
  isApiErrorResponse,
  isContactReceivedResponse,
  isExperienceResponse,
  isHealthResponse,
  isProjectResponse,
  isSkillResponse,
} from './guards';

export { getProjectBySlug, listProjects } from './projects';
export { listExperience } from './experience';
export { listSkills } from './skills';
export { submitContactMessage, type ContactMessageInput } from './contact';
export { getHealth } from './health';
