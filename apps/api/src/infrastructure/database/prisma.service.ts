import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * Prisma entry point for the API.
 *
 * Prisma 7 no longer bundles a query engine, so the client is constructed with
 * a driver adapter: `@prisma/adapter-pg` over `pg`. The connection string comes
 * from the validated runtime configuration (see `infrastructure/config`).
 *
 * This class and the repositories are the only places allowed to touch the
 * generated client; domain and application code stay free of Prisma
 * (AGENTS.md section 13).
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
