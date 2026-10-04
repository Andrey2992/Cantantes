import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * Provides the database client to the whole application.
 *
 * It is global because the client is infrastructure plumbing shared by every
 * repository, and because feature modules should not have to re-import it
 * (AGENTS.md section 10: infrastructure may be depended on by the layers above,
 * never the other way round).
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
