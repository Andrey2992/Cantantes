import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * EN: Prisma entry point for the API.
 *
 * Prisma 7 no longer bundles a query engine, so the client is constructed with a
 * driver adapter: `@prisma/adapter-pg` over `pg`. The connection string comes from
 * the validated runtime configuration (see `infrastructure/config`).
 *
 * This class and the repositories are the only places allowed to touch the
 * generated client; domain and application code stay free of Prisma (AGENTS.md
 * section 13).
 *
 * Boot behaviour: `onModuleInit` tries to connect but treats a failure as
 * non-fatal. This lets the API boot and serve `GET /api/health` as `503` while the
 * database is down; without it, the health endpoint could never report the true
 * state. Every real query still fails normally and is translated to a constant
 * `500` by the exception filter.
 *
 * ES: Punto de entrada de Prisma para la API.
 *
 * Prisma 7 ya no incluye un motor de consultas, así que el cliente se construye
 * con un adaptador de driver: `@prisma/adapter-pg` sobre `pg`. La cadena de
 * conexión proviene de la configuración de runtime validada (ver
 * `infrastructure/config`).
 *
 * Esta clase y los repositorios son los únicos lugares permitidos para tocar el
 * cliente generado; el código de dominio y aplicación permanece libre de Prisma
 * (AGENTS.md sección 13).
 *
 * Comportamiento de arranque: `onModuleInit` intenta conectar pero trata el fallo
 * como no fatal. Esto permite que la API arranque y sirva `GET /api/health` como
 * `503` mientras la base de datos esté caída; sin esto, el endpoint de salud jamás
 * podría reportar el estado real. Toda consulta real sigue fallando normalmente y
 * el filtro de excepciones la traduce a un `500` constante.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /** EN: Logger used while booting. / ES: Logger usado durante el arranque. */
  private readonly appLogger: Logger;

  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    });
    this.appLogger = new Logger(PrismaService.name);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      // Log a warning, never the connection string or the driver error: those
      // could contain credentials (AGENTS.md section 18).
      this.appLogger.warn(
        'Database connection failed at startup; health will report the database as down until it recovers.',
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
