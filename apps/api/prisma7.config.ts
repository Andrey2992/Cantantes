/**
 * Prisma CLI configuration.
 *
 * Since Prisma 7 the datasource URL is read from this file instead of
 * `prisma/schema.prisma`, so every `prisma` command in this workspace is
 * resolved from here.
 *
 * Credentials are never committed: they come from the repository-root `.env`
 * (git-ignored), which is also the file `docker-compose.yml` reads to start
 * PostgreSQL. The path is resolved relative to this file so the commands work
 * from any working directory.
 */
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';
import { fileURLToPath } from 'node:url';

loadEnv({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
  quiet: true,
});

export default defineConfig({
  schema: fileURLToPath(new URL('prisma/schema.prisma', import.meta.url)),
  migrations: {
    // Migrations are versioned at the repository level, not inside the app.
    path: fileURLToPath(new URL('../../database/migrations', import.meta.url)),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
