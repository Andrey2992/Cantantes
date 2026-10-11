import type { ContactMessage } from '../entities/ContactMessage.js';

/**
 * EN: Persistence port for the ContactMessage aggregate.
 *
 * Belongs to the domain; the Prisma implementation lives in infrastructure
 * (AGENTS.md sections 8 and 13). It exposes a single append operation because
 * contact messages are write-only from the API's point of view: nothing reads
 * them back through HTTP, so a `findAll` that nothing calls would be speculative
 * (AGENTS.md section 18).
 *
 * ES: Puerto de persistencia del agregado ContactMessage.
 *
 * Pertenece al dominio; la implementación con Prisma vive en infraestructura
 * (AGENTS.md secciones 8 y 13). Expone una sola operación de anexado porque los
 * mensajes de contacto son de solo escritura desde el punto de vista de la API:
 * nada los lee de vuelta por HTTP, así que un `findAll` que nadie llama sería
 * especulativo (AGENTS.md sección 18).
 */
export interface ContactMessageRepository {
  /**
   * EN: Persists a received message.
   * @param message A validated aggregate. The implementation maps it to a row.
   * @returns Resolves once the row was stored.
   *
   * ES: Persiste un mensaje recibido.
   * @param message Un agregado validado. La implementación lo mapea a una fila.
   * @returns Resuelve una vez almacenada la fila.
   */
  save(message: ContactMessage): Promise<void>;
}
