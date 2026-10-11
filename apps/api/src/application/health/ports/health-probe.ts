/**
 * EN: Result of probing a single dependency. `'up'` means the dependency answered
 * when asked; `'down'` means the probe could not reach it.
 *
 * ES: Resultado de sondear una dependencia individual. `'up'` significa que la
 * dependencia respondió al ser consultada; `'down'` significa que la sonda no
 * pudo alcanzarla.
 */
export type DependencyStatus = 'up' | 'down';

/**
 * EN: Port used by the health use case to check a dependency.
 *
 * The contract is simple on purpose: the probe never throws. A failing dependency
 * is reported as `'down'`, not as an exception, because an unhandled error during
 * a health poll would defeat the purpose of the endpoint. Whether the probe runs
 * SQL, an HTTP ping or something else is an infrastructure concern (AGENTS.md
 * sections 8 and 10).
 *
 * ES: Puerto usado por el caso de uso de salud para comprobar una dependencia.
 *
 * El contrato es simple a propósito: la sonda nunca lanza. Una dependencia que
 * falla se reporta como `'down'`, no como excepción, porque un error no controlado
 * durante una consulta de salud anularía el propósito del endpoint. Que la sonda
 * ejecute SQL, un ping HTTP u otra cosa es una preocupación de infraestructura
 * (AGENTS.md secciones 8 y 10).
 */
export interface HealthProbe {
  /**
   * EN: Asks the dependency whether it is reachable.
   * @returns `'up'` or `'down'`, never a rejection.
   *
   * ES: Pregunta a la dependencia si está accesible.
   * @returns `'up'` o `'down'`, nunca un rechazo.
   */
  check(): Promise<DependencyStatus>;
}

/**
 * EN: Injection token for the database health probe. Provided in the composition
 * root and replaced by a fixed double in tests.
 *
 * ES: Token de inyección de la sonda de salud de la base de datos. Se provee en la
 * raíz de composición y se reemplaza por un doble fijo en las pruebas.
 */
export const HEALTH_PROBE = Symbol('HEALTH_PROBE');
