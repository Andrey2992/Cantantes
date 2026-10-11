import type {
  DependencyStatus,
  HealthProbe,
} from '../../src/application/health/ports/health-probe.js';

/**
 * EN: Fixed implementation of the {@link HealthProbe} port for tests.
 *
 * It always answers the configured status, letting HTTP tests cover both the
 * healthy (`200`) and degraded (`503`) branches without a database.
 *
 * ES: Implementación fija del puerto {@link HealthProbe} para pruebas.
 *
 * Siempre responde el estado configurado, permitiendo que las pruebas HTTP cubran
 * tanto la rama sana (`200`) como la degradada (`503`) sin base de datos.
 */
export class StubHealthProbe implements HealthProbe {
  constructor(private readonly status: DependencyStatus) {}

  async check(): Promise<DependencyStatus> {
    return this.status;
  }
}
