import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * EN: Provides the database client to the whole application.
 *
 * It is global because the client is infrastructure plumbing shared by every
 * repository, and because feature modules should not have to re-import it
 * (AGENTS.md section 10: infrastructure may be depended on by the layers above,
 * never the other way round).
 *
 * ES: Provee el cliente de base de datos a toda la aplicación.
 *
 * Es global porque el cliente es infraestructura compartida por todos los
 * repositorios, y porque los módulos de características no deberían tener que
 * reimportarlo (AGENTS.md sección 10: las capas superiores pueden depender de la
 * infraestructura, nunca al revés).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
