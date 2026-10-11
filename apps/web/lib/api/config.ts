import { ApiConfigError } from './errors';

/**
 * EN: Central configuration of the frontend API integration.
 *
 * There is a single source of truth for the backend location: the `API_BASE_URL`
 * environment variable. It is intentionally **not** prefixed with
 * `NEXT_PUBLIC_`, so Next.js only exposes it on the server. The browser never
 * learns the API origin, which is correct here because all data is fetched from
 * Server Components and the contact form is submitted through a Server Action
 * (see `docs/frontend/api-integration.md`).
 *
 * ES: Configuración central de la integración de API del frontend.
 *
 * Hay una sola fuente de verdad para la ubicación del backend: la variable de
 * entorno `API_BASE_URL`. A propósito **no** lleva el prefijo `NEXT_PUBLIC_`, de
 * modo que Next.js solo la expone en el servidor. El navegador nunca conoce el
 * origen de la API, lo cual es correcto aquí porque todos los datos se obtienen
 * desde Server Components y el formulario de contacto se envía mediante una
 * Server Action (ver `docs/frontend/api-integration.md`).
 */

/** EN: Name of the environment variable that holds the API base URL. / ES: Nombre de la variable de entorno que contiene la URL base de la API. */
export const API_BASE_URL_ENV_VAR = 'API_BASE_URL';

/**
 * EN: Guards that the API layer only runs on the server.
 *
 * If a future edit imports this module from a Client Component, Next.js would
 * silently inline a `undefined` value. Failing here instead turns an easy-to-miss
 * runtime bug into an immediate, explicit error.
 *
 * @throws {ApiConfigError} When `window` is defined, i.e. the code is running in
 * a browser.
 *
 * ES: Verifica que la capa de API solo se ejecute en el servidor.
 *
 * Si una edición futura importa este módulo desde un Client Component, Next.js
 * incorporaría silenciosamente un valor `undefined`. Fallar aquí convierte un bug
 * de runtime fácil de pasar por alto en un error inmediato y explícito.
 *
 * @throws {ApiConfigError} Cuando `window` está definido, es decir, el código se
 * ejecuta en un navegador.
 */
export function assertServerRuntime(): void {
  if (typeof window !== 'undefined') {
    throw new ApiConfigError(
      'The API client is server-only. Do not import it from a Client Component.',
    );
  }
}

/**
 * EN: Resolves and validates the backend base URL.
 *
 * Accepts only absolute `http:`/`https:` URLs and returns them without a trailing
 * slash so path building stays predictable. It never falls back to a hardcoded
 * origin: a missing value is a deployment mistake that should be fixed, not
 * guessed.
 *
 * @param raw Raw value. Defaults to `process.env.API_BASE_URL`; injecting it is
 * what makes this function unit-testable.
 * @returns The normalized base URL, for example `http://localhost:3001`.
 * @throws {ApiConfigError} When the value is missing, empty, unparsable or not
 * http(s), or when called in a browser.
 *
 * ES: Resuelve y valida la URL base del backend.
 *
 * Valida y valida la URL base del backend.
 *
 * @param raw Valor crudo. Por defecto `process.env.API_BASE_URL`; inyectarlo es
 * lo que hace que esta función sea testeable por unidad.
 * @returns La URL base normalizada, por ejemplo `http://localhost:3001`.
 * @throws {ApiConfigError} Cuando el valor falta, está vacío, no se puede parsear
 * o no es http(s).
 */
export function resolveApiBaseUrl(
  raw: string | undefined = process.env[API_BASE_URL_ENV_VAR],
): string {
  assertServerRuntime();

  const value = raw?.trim();

  if (value === undefined || value === '') {
    throw new ApiConfigError(
      `Missing ${API_BASE_URL_ENV_VAR}. Copy apps/web/.env.example to apps/web/.env.local and set the API origin (for example http://localhost:3001).`,
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new ApiConfigError(
      `${API_BASE_URL_ENV_VAR} must be an absolute URL (received "${value}").`,
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ApiConfigError(
      `${API_BASE_URL_ENV_VAR} must use the http or https protocol (received "${parsed.protocol}").`,
    );
  }

  // `URL.toString()` always renders the root path as `/`; drop it so callers can
  // safely join paths with a single leading slash.
  return parsed.toString().replace(/\/$/, '');
}
