import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap/configure-app.js';

/**
 * EN: The API listens on 3001 by default so it can run alongside the Next.js
 * development server on 3000. The port and the allowed browser origins come from
 * the validated runtime configuration (see `infrastructure/config`).
 *
 * ES: La API escucha en 3001 por defecto para poder correr junto al servidor de
 * desarrollo de Next.js en 3000. El puerto y los orígenes de navegador permitidos
 * provienen de la configuración de runtime validada (ver `infrastructure/config`).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'));
}

await bootstrap();
