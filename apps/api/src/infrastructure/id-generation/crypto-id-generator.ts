import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { IdGenerator } from '../../application/shared/ports/id-generator.js';

/**
 * EN: Infrastructure implementation of the {@link IdGenerator} port.
 *
 * It produces version-4 UUIDs via `node:crypto`. The import stays here, in
 * infrastructure, so the application and domain layers never depend on a concrete
 * random facility; tests replace this provider with a deterministic double.
 *
 * ES: Implementación de infraestructura del puerto {@link IdGenerator}.
 *
 * Produce UUID versión 4 mediante `node:crypto`. El import se queda aquí, en
 * infraestructura, para que las capas de aplicación y dominio nunca dependan de
 * una instalación aleatoria concreta; las pruebas reemplazan este proveedor por
 * un doble determinista.
 */
@Injectable()
export class CryptoIdGenerator implements IdGenerator {
  /**
   * EN: Returns a new version-4 UUID.
   * @returns A string unique enough for aggregate identities.
   *
   * ES: Devuelve un nuevo UUID versión 4.
   * @returns Una cadena suficientemente única para identidades de agregados.
   */
  next(): string {
    return randomUUID();
  }
}
