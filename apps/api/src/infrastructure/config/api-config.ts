import type { ConfigModuleOptions } from '@nestjs/config';
import { fileURLToPath } from 'node:url';

/**
 * Runtime configuration of the API.
 *
 * Values come from the process environment and, in development, from the
 * repository-root `.env` (git-ignored, never committed). `docker-compose.yml`
 * reads the same file for PostgreSQL, so there is a single source of truth.
 *
 * `validate` exists to fail fast: a missing `DATABASE_URL` or an unparsable
 * `PORT` aborts the boot with a clear message instead of surfacing as a 500 on
 * the first request.
 */
export interface ApiConfig {
  /** PostgreSQL connection string consumed by the Prisma driver adapter. */
  readonly DATABASE_URL: string;
  /** Browser origins allowed to call the API (CORS allowlist). */
  readonly WEB_ORIGIN: readonly string[];
  /** TCP port of the HTTP server. */
  readonly PORT: number;
}

/** Next.js development server, used when `WEB_ORIGIN` is not set. */
export const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';

/** Kept in sync with `main.ts` so the API can run next to the web dev server. */
export const DEFAULT_PORT = 3001;

function readString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];

  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

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
 * `ConfigModule.forRoot()` options.
 *
 * The `.env` path is resolved relative to this file so it works from the
 * repository root, from `apps/api`, and from a compiled `dist/` tree.
 */
export const apiConfigModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  // apps/api/src/infrastructure/config -> repository root.
  envFilePath: [fileURLToPath(new URL('../../../../../.env', import.meta.url))],
  validate: validateApiConfig,
};
