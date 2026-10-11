import { Injectable } from '@nestjs/common';
import type {
  DependencyStatus,
  HealthProbe,
} from '../../application/health/ports/health-probe.js';
import { PrismaService } from '../database/prisma.service.js';

/**
 * EN: Infrastructure implementation of the {@link HealthProbe} port for the
 * database.
 *
 * It asks the real driver for a trivial round trip (`SELECT 1`) and reports the
 * result. It never re-throws: a failure is encoded as `'down'` so the health
 * endpoint can answer a 503 instead of crashing. Queries by other endpoints are
 * unaffected — they keep failing normally and translate to a 500 through the
 * exception filter.
 *
 * ES: Implementación de infraestructura del puerto {@link HealthProbe} para la
 * base de datos.
 *
 * Le pide al driver real un viaje de ida y vuelta trivial (`SELECT 1`) y reporta
 * el resultado. Nunca vuelve a lanzar: un fallo se codifica como `'down'` para que
 * el endpoint de salud pueda responder un 503 en lugar de colapsar. Las consultas
 * de otros endpoints no se ven afectadas: siguen fallando normalmente y se
 * traducen a un 500 mediante el filtro de excepciones.
 */
@Injectable()
export class PrismaHealthProbe implements HealthProbe {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * EN: Runs a `SELECT 1` round trip.
   * @returns `'up'` when the query succeeds, `'down'` on any failure.
   *
   * ES: Ejecuta un viaje de ida y vuelta `SELECT 1`.
   * @returns `'up'` cuando la consulta tiene éxito, `'down'` ante cualquier fallo.
   */
  async check(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }
}
