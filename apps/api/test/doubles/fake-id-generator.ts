import type { IdGenerator } from '../../src/application/shared/ports/id-generator.js';

/**
 * EN: Deterministic implementation of the {@link IdGenerator} port for tests.
 *
 * It emits an ascending, predictable sequence (`seq_1`, `seq_2`, ...) so use-case
 * tests can assert the assigned identity without depending on `node:crypto`.
 *
 * ES: Implementación determinista del puerto {@link IdGenerator} para pruebas.
 *
 * Emite una secuencia ascendente y predecible (`seq_1`, `seq_2`, ...) para que las
 * pruebas de caso de uso puedan comprobar la identidad asignada sin depender de
 * `node:crypto`.
 */
export class FakeIdGenerator implements IdGenerator {
  private counter = 0;

  constructor(private readonly prefix = 'seq_') {}

  next(): string {
    this.counter += 1;
    return `${this.prefix}${this.counter}`;
  }
}
