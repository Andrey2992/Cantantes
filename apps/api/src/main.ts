import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap/configure-app.js';

/**
 * The API listens on 3001 by default so it can run alongside the Next.js
 * development server on 3000. The port and the allowed browser origins come from
 * the validated runtime configuration (see `infrastructure/config`).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  await app.listen(app.get(ConfigService).getOrThrow<number>('PORT'));
}

await bootstrap();
