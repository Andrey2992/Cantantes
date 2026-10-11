import type { ConfigModuleOptions } from '@nestjs/config';
import { fileURLToPath } from 'node:url';

/**
 * EN: Runtime configuration of the API.
 *
 * Values come from the process environment and, in development, from the
 * repository-root `.env` (git-ignored, never committed). `docker-compose.yml`
 * reads the same file for PostgreSQL, so there is a single source of truth.
 *
 * `validate` exists to fail fast: a missing `DATABASE_URL` or an unparsable
 * `PORT` aborts the boot with a clear message instead of surfacing as a 500 on
 * the first request.
 *
 * ES: Configuración de runtime de la API.
 *
 * Los valores provienen del entorno del proceso y, en desarrollo, del `.env` en
 * la raíz del repositorio (ignorado por git, nunca comprometido).
 * `docker-compose.yml` lee el mismo archivo para PostgreSQL, así que hay una sola
 * fuente de verdad.
 *
 * `validate` existe para fallar rápido: un `DATABASE_URL` ausente o un `PORT` no
 * parseable aborta el arranque con un mensaje claro en lugar de aparecer como un
 * 500 en la primera petición.
 */
export interface ApiConfig {
  /** EN: PostgreSQL connection string consumed by the Prisma driver adapter. / ES: Cadena de conexión de PostgreSQL consumida por el adaptador de driver de Prisma. */
  readonly DATABASE_URL: string;
  /** EN: Browser origins allowed to call the API (CORS allowlist). / ES: Orígenes de navegador permitidos para llamar a la API (lista blanca de CORS). */
  readonly WEB_ORIGIN: readonly string[];
  /** EN: TCP port of the HTTP server. / ES: Puerto TCP del servidor HTTP. */
  readonly PORT: number;
}

/** EN: Next.js development server, used when `WEB_ORIGIN` is not set. / ES: Servidor de desarrollo de Next.js, usado cuando `WEB_ORIGIN` no está definido. */
export const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';

/** EN: Kept in sync with `main.ts` so the API can run next to the web dev server. / ES: Se mantiene sincronizado con `main.ts` para que la API corra junto al servidor de desarrollo web. */
export const DEFAULT_PORT = 3001;

/**
 * EN: Reads a required-ish string from the raw config map, normalizing empty
 * values to `undefined` so the callers can apply their own default.
 *
 * ES: Lee una cadena del mapa de configuración cruda, normalizando los valores
 * vacíos a `undefined` para que los llamadores apliquen su propio valor por
 * defecto.
 */
function readString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];

  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

/**
 * EN: Parses the comma-separated CORS allowlist, falling back to the Next.js dev
 * origin. An empty result is a configuration error, so it throws.
 *
 * ES: Parsea la lista blanca de CORS separada por comas, con el origen de
 * desarrollo de Next.js como reserva. Un resultado vacío es un error de
 * configuración, así que lanza.
 */
function parseOrigins(raw: string | undefined): readonly string[] {
  const origins = (raw ?? DEFAULT_WEB_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '');

  if (origins.length === 0) {
    throw new Error('WEB_ORIGIN must contain at least one origin');
  }

  return origins;
}

/**
 * EN: Parses and bounds the TCP port, falling back to the default.
 *
 * ES: Parsea y acota el puerto TCP, con el valor por defecto como reserva.
 */
function parsePort(raw: string | undefined): number {
  if (raw === undefined) {
    return DEFAULT_PORT;
  }

  const port = Number(raw);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

/**
 * EN: Validates the raw environment into a typed `ApiConfig`, failing fast on a
 * missing `DATABASE_URL`. Passed to `ConfigModule.forRoot` as `validate`.
 *
 * ES: Valida el entorno crudo hacia un `ApiConfig` tipado, fallando rápido si
 * falta `DATABASE_URL`. Se pasa a `ConfigModule.forRoot` como `validate`.
 */
export function validateApiConfig(config: Record<string, unknown>): ApiConfig {
  const databaseUrl = readString(config, 'DATABASE_URL');

  if (databaseUrl === undefined) {
    throw new Error('DATABASE_URL is required');
  }

  return {
    DATABASE_URL: databaseUrl,
    WEB_ORIGIN: parseOrigins(readString(config, 'WEB_ORIGIN')),
    PORT: parsePort(readString(config, 'PORT')),
  };
}

/**
 * EN: `ConfigModule.forRoot()` options.
 *
 * The `.env` path is resolved relative to this file so it works from the
 * repository root, from `apps/api`, and from a compiled `dist/` tree.
 *
 * ES: Opciones de `ConfigModule.forRoot()`.
 *
 * La ruta del `.env` se resuelve relativa a este archivo para que funcione desde
 * la raíz del repositorio, desde `apps/api` y desde un árbol `dist/` compilado.
 */
export const apiConfigModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  // apps/api/src/infrastructure/config -> repository root.
  envFilePath: [fileURLToPath(new URL('../../../../../.env', import.meta.url))],
  validate: validateApiConfig,
};
