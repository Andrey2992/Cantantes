import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * The API listens on 3001 by default so it can run alongside the Next.js
 * development server on 3000. Override it with the `PORT` environment variable.
 */
const DEFAULT_PORT = 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
await bootstrap();
