import type { HealthResponse } from '@cantantes/types';
import {
  Controller,
  Get,
  HttpStatus,
  Res,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import type { Response } from 'express';
import { CheckHealth } from '../../application/health/use-cases/check-health.js';

/**
 * EN: Health surface of the application (`GET /api/health`).
 *
 * Unlike the feature controllers this route is intentionally version-neutral:
 * ops tooling should not have to track the API version to probe liveness.
 * It uses a passthrough response to set the status code so the body always keeps
 * the {@link HealthResponse} shape instead of the error envelope.
 *
 * ES: Superficie de salud de la aplicación (`GET /api/health`).
 *
 * A diferencia de los controladores de características, esta ruta es
 * intencionalmente neutra en versión: las herramientas de operaciones no deberían
 * tener que rastrear la versión de la API para comprobar la liveness. Usa una
 * respuesta passthrough para fijar el código de estado y que el cuerpo conserve
 * siempre la forma de {@link HealthResponse} en lugar del envoltorio de error.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly checkHealth: CheckHealth) {}

  /**
   * EN: Probes application health.
   * @param response Express response used to set `200`/`503` while still letting
   * Nest serialize the returned body.
   * @returns `{ status: 'ok', database: 'up' }` with `200`, or
   * `{ status: 'degraded', database: 'down' }` with `503`.
   *
   * ES: Sondea la salud de la aplicación.
   * @param response Respuesta Express usada para fijar `200`/`503` mientras Nest
   * sigue serializando el cuerpo devuelto.
   * @returns `{ status: 'ok', database: 'up' }` con `200`, o
   * `{ status: 'degraded', database: 'down' }` con `503`.
   */
  @Get()
  @Version(VERSION_NEUTRAL)
  async check(
    @Res({ passthrough: true }) response: Response,
  ): Promise<HealthResponse> {
    const report = await this.checkHealth.execute();
    const healthy = report.database === 'up';

    response.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

    return {
      status: healthy ? 'ok' : 'degraded',
      database: report.database,
    };
  }
}
