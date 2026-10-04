import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Applies the runtime HTTP configuration to a Nest application.
 *
 * It lives outside `main.ts` so the test application is configured exactly like
 * the real one; otherwise CORS behaviour would only be verifiable by hand.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  // Explicit allowlist instead of a wildcard: the API is read-only, so browsers
  // only need `GET` and no credentials are involved.
  app.enableCors({
    origin: [...config.getOrThrow<readonly string[]>('WEB_ORIGIN')],
    methods: ['GET'],
    credentials: false,
  });

  // Lets the database client disconnect cleanly on SIGTERM.
  app.enableShutdownHooks();
}
