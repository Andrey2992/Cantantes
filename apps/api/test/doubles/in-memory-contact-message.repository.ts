import type { ContactMessage } from '../../src/domain/contact/entities/ContactMessage.js';
import type { ContactMessageRepository } from '../../src/domain/contact/repositories/ContactMessageRepository.js';

/**
 * EN: In-memory implementation of the ContactMessage port, used as a test double.
 *
 * It records every saved aggregate in a public array so tests can assert that
 * persistence happened (AGENTS.md section 19).
 *
 * ES: Implementación en memoria del puerto de ContactMessage, usada como doble de
 * prueba.
 *
 * Registra cada agregado guardado en un arreglo público para que las pruebas
 * puedan comprobar que la persistencia ocurrió (AGENTS.md sección 19).
 */
export class InMemoryContactMessageRepository implements ContactMessageRepository {
  readonly stored: ContactMessage[] = [];

  async save(message: ContactMessage): Promise<void> {
    this.stored.push(message);
  }
}
