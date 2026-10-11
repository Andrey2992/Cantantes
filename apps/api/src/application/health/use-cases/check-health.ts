import type { DependencyStatus, HealthProbe } from '../ports/health-probe.js';

/**
 * EN: Report produced by the health use case.
 *
 * ES: Informe producido por el caso de uso de salud.
 */
export type HealthReport = {
  readonly database: DependencyStatus;
};

/**
 * EN: Use case — probe the health of the application dependencies.
 *
 * It deliberately does not throw: health answers are data, and a probe failure
 * must be encoded as a `'down'` status that the presentation layer turns into the
 * right HTTP status code.
 *
 * ES: Caso de uso — sondear la salud de las dependencias de la aplicación.
 *
 * Deliberadamente no lanza: las respuestas de salud son datos, y el fallo de una
 * sonda debe codificarse como un estado `'down'` que la capa de presentación
 * convierte en el código de estado HTTP correcto.
 */
export class CheckHealth {
  constructor(private readonly probe: HealthProbe) {}

  /**
   * EN: Probes every registered dependency.
   * @returns A {@link HealthReport} describing each dependency. Network or
   * database failures surface as `'down'`, never as a rejection.
   *
   * ES: Sondea todas las dependencias registradas.
   * @returns Un {@link HealthReport} que describe cada dependencia. Los fallos de
   * red o de base de datos aparecen como `'down'`, nunca como un rechazo.
   */
  async execute(): Promise<HealthReport> {
    return {
      database: await this.probe.check(),
    };
  }
}
