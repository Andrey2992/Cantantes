import { VersioningType, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * EN: Applies the runtime HTTP configuration to a Nest application.
 *
 * It lives outside `main.ts` so the test application is configured exactly like
 * the real one; otherwise CORS behaviour and URL prefixing would only be
 * verifiable by hand.
 *
 * Routing decisions:
 * - Global prefix `api` plus URI versioning with `v1` as the default. Feature
 *   controllers are served at `/api/v1/...`, while the health endpoint opts into
 *   a version-neutral route and stays at `/api/health`.
 * - CORS keeps an explicit allowlist instead of a wildcard. `POST` was added once
 *   the contact endpoint arrived; no credentials are involved.
 *
 * ES: Aplica la configuración HTTP de runtime a una aplicación Nest.
 *
 * Vive fuera de `main.ts` para que la aplicación de prueba quede configurada
 * exactamente igual que la real; de otro modo el comportamiento de CORS y el
 * prefijo de URLs solo serían verificables a mano.
 *
 * Decisiones de enrutado:
 * - Prefijo global `api` más versionado por URI con `v1` como versión por
 *   defecto. Los controladores de características se sirven en `/api/v1/...`,
 *   mientras que el endpoint de salud opta por una ruta neutra en versión y se
 *   queda en `/api/health`.
 * - CORS mantiene una lista blanca explícita en lugar de un comodín. Se añadió
 *   `POST` cuando llegó el endpoint de contacto; no intervienen credenciales.
 */
export function configureApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  // Explicit allowlist instead of a wildcard: the API exposes read endpoints and
  // a contact form, so browsers only need `GET` and `POST`, and no credentials
  // are involved.
  app.enableCors({
    origin: [...configService.getOrThrow<readonly string[]>('WEB_ORIGIN')],
    methods: ['GET', 'POST'],
    credentials: false,
  });

  // Feature routes live under /api/v1 (URI versioning), health stays neutral.
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Lets the database client disconnect cleanly on SIGTERM.
  app.enableShutdownHooks();
}
