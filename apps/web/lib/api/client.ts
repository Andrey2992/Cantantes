import { resolveApiBaseUrl } from './config';
import { ApiError, ApiNetworkError, ApiParseError } from './errors';
import { isApiErrorResponse } from './guards';

/**
 * EN: Low-level, typed HTTP client for the backend API.
 *
 * Responsibilities, and deliberately nothing else:
 * - build the absolute URL from the centralized base URL;
 * - send and receive JSON;
 * - normalize every failure into the error hierarchy in `errors.ts`.
 *
 * It holds no domain logic and no React/Next API, so it is reusable from Server
 * Components, Server Actions and tests alike. Resources (`projects.ts`,
 * `contact.ts`, ...) add the endpoint paths and contract validation on top.
 *
 * ES: Cliente HTTP de bajo nivel y tipado para la API del backend.
 *
 * Responsabilidades, y deliberadamente nada más:
 * - construir la URL absoluta desde la URL base centralizada;
 * - enviar y recibir JSON;
 * - normalizar cada fallo en la jerarquía de errores de `errors.ts`.
 *
 * No contiene lógica de dominio ni API de React/Next, por lo que es reutilizable
 * desde Server Components, Server Actions y pruebas por igual. Los recursos
 * (`projects.ts`, `contact.ts`, ...) añaden encima las rutas de los endpoints y la
 * validación de contratos.
 */

/**
 * EN: Options accepted by every request helper.
 *
 * `baseUrl` and `fetchImpl` exist for tests and for the opt-in integration test;
 * production callers rely on the defaults (`API_BASE_URL` and global `fetch`).
 *
 * ES: Opciones aceptadas por cada helper de petición.
 *
 * `baseUrl` y `fetchImpl` existen para las pruebas y para la prueba de integración
 * opcional; los llamadores de producción usan los valores por defecto
 * (`API_BASE_URL` y `fetch` global).
 */
export interface ApiRequestOptions {
  /** EN: HTTP method. Only the verbs this API exposes. / ES: Método HTTP. Solo los verbos que expone esta API. */
  readonly method?: 'GET' | 'POST';
  /** EN: Serializable request body, JSON-encoded by the client. / ES: Cuerpo de petición serializable, codificado a JSON por el cliente. */
  readonly body?: unknown;
  /** EN: Caller-supplied abort signal. / ES: Señal de aborto provista por el llamador. */
  readonly signal?: AbortSignal;
  /** EN: Next.js fetch cache policy. Defaults to `no-store`. / ES: Política de caché de fetch de Next.js. Por defecto `no-store`. */
  readonly cache?: RequestCache;
  /** EN: Base URL override, mainly for tests. / ES: Anulación de la URL base, principalmente para pruebas. */
  readonly baseUrl?: string;
  /** EN: `fetch` override, mainly for tests. / ES: Anulación de `fetch`, principalmente para pruebas. */
  readonly fetchImpl?: typeof fetch;
}

/** EN: A raw API answer: status plus parsed body. / ES: Una respuesta cruda de la API: estado más cuerpo parseado. */
export interface ApiResult<T> {
  /** EN: HTTP status code. / ES: Código de estado HTTP. */
  readonly status: number;
  /** EN: Parsed JSON body, guarded by the caller. / ES: Cuerpo JSON parseado, validado por el llamador. */
  readonly data: T;
}

// Sentinel returned by the JSON reader when the body is empty or not JSON. It lets
// `apiRequest` decide what a parse failure means based on the status code.
// Centinela que devuelve el lector JSON cuando el cuerpo está vacío o no es JSON.
// Permite que `apiRequest` decida qué significa un fallo de parseo según el estado.
const PARSE_FAILED = Symbol('api-parse-failed');

/**
 * EN: Sends a request and returns the raw status and parsed body without judging
 * the status code.
 *
 * Use this for endpoints that treat non-2xx as data (the health endpoint answers
 * `503` with a valid body). For ordinary endpoints prefer {@link apiFetch}, which
 * turns a non-2xx into an {@link ApiError}.
 *
 * @param path API path beginning with `/`, for example `/api/v1/projects`.
 * @param options Request options, see {@link ApiRequestOptions}.
 * @returns The status and the parsed body.
 * @throws {ApiConfigError} When the base URL is missing or invalid.
 * @throws {ApiNetworkError} When the request never completes.
 * @throws {ApiParseError} When a successful (`2xx`) body is not valid JSON.
 *
 * ES: Envía una petición y devuelve el estado crudo y el cuerpo parseado sin
 * juzgar el código de estado.
 *
 * Úsalo para endpoints que tratan un no-2xx como dato (el endpoint de salud
 * responde `503` con un cuerpo válido). Para endpoints ordinarios prefiere
 * {@link apiFetch}, que convierte un no-2xx en un {@link ApiError}.
 *
 * @param path Ruta de la API que empieza con `/`, por ejemplo `/api/v1/projects`.
 * @param options Opciones de la petición, ver {@link ApiRequestOptions}.
 * @returns El estado y el cuerpo parseado.
 * @throws {ApiConfigError} Cuando la URL base falta o no es válida.
 * @throws {ApiNetworkError} Cuando la petición nunca se completa.
 * @throws {ApiParseError} Cuando un cuerpo exitoso (`2xx`) no es JSON válido.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const baseUrl = options.baseUrl ?? resolveApiBaseUrl();
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = new URL(path, `${baseUrl}/`);

  const headers: Record<string, string> = { Accept: 'application/json' };
  const hasBody = options.body !== undefined;

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;

  try {
    response = await fetchImpl(url, {
      method: options.method ?? 'GET',
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      // Next.js 16 does not cache `fetch` by default, but the policy is pinned
      // here so the API layer behaves the same regardless of framework defaults.
      cache: options.cache ?? 'no-store',
    });
  } catch (cause) {
    throw new ApiNetworkError(
      `Could not reach the API at ${url.origin}.`,
      cause,
    );
  }

  const parsed = await readJson<T>(response);
  const isSuccess = response.status >= 200 && response.status < 300;

  if (parsed === PARSE_FAILED) {
    // A successful response that is not JSON is a protocol bug; a failed response
    // may legitimately carry a non-JSON body (for example a proxy error page), so
    // `apiFetch` turns it into an `ApiError` with a `null` body instead.
    if (isSuccess) {
      throw new ApiParseError(
        response.status,
        'The API returned a body that is not valid JSON.',
      );
    }

    return { status: response.status, data: undefined as unknown as T };
  }

  return { status: response.status, data: parsed };
}

/**
 * EN: Sends a request and returns the body only when the status is `2xx`.
 *
 * This is the default helper for the read/write resources. A non-2xx becomes an
 * {@link ApiError} whose `body` is the parsed `{ statusCode, error, message }`
 * envelope when the server sent one, and `null` otherwise.
 *
 * @param path API path beginning with `/`.
 * @param options Request options, see {@link ApiRequestOptions}.
 * @returns The parsed body.
 * @throws {ApiError} On a non-2xx status.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When a `2xx` body is not valid JSON.
 *
 * ES: Envía una petición y devuelve el cuerpo solo cuando el estado es `2xx`.
 *
 * Es el helper por defecto de los recursos de lectura/escritura. Un no-2xx se
 * convierte en un {@link ApiError} cuyo `body` es el envoltorio
 * `{ statusCode, error, message }` parseado cuando el servidor envió uno, y `null`
 * en caso contrario.
 *
 * @param path Ruta de la API que empieza con `/`.
 * @param options Opciones de la petición, ver {@link ApiRequestOptions}.
 * @returns El cuerpo parseado.
 * @throws {ApiError} Con un estado distinto de 2xx.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando un cuerpo `2xx` no es JSON válido.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { status, data } = await apiRequest<T>(path, options);

  if (status < 200 || status >= 300) {
    const body = isApiErrorResponse(data) ? data : null;

    throw new ApiError(
      status,
      body,
      body?.message ?? `The API answered with status ${status}.`,
    );
  }

  return data;
}

/**
 * EN: Reads a response body as JSON without throwing.
 *
 * @param response Fetch response.
 * @returns The parsed body, or {@link PARSE_FAILED} when the body is empty or not
 * valid JSON.
 *
 * ES: Lee el cuerpo de una respuesta como JSON sin lanzar.
 *
 * @param response Respuesta de fetch.
 * @returns El cuerpo parseado, o {@link PARSE_FAILED} cuando el cuerpo está vacío
 * o no es JSON válido.
 */
async function readJson<T>(response: Response): Promise<T | typeof PARSE_FAILED> {
  const text = await response.text();

  if (text.trim() === '') {
    return PARSE_FAILED;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return PARSE_FAILED;
  }
}
