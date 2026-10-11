import type { Experience } from '../entities/Experience.js';

/**
 * EN: Persistence port for the Experience aggregate.
 *
 * This interface belongs to the domain: use cases depend on it, the Prisma
 * implementation lives in the infrastructure layer (AGENTS.md sections 8 and 13).
 * It speaks in domain types and knows nothing about Prisma models, SQL, HTTP or
 * NestJS.
 *
 * The portfolio experience list is a small, read-only roster, so the port
 * exposes a single read operation. There is deliberately no `save`: no use case
 * writes an experience record yet, and adding a write method that nothing calls
 * would be speculative (AGENTS.md section 18).
 *
 * Ordering is not part of the contract; the implementation decides a stable,
 * most-recent-first order so the HTTP response is deterministic.
 *
 * ES: Puerto de persistencia del agregado Experience.
 *
 * Esta interfaz pertenece al dominio: los casos de uso dependen de ella y la
 * implementación con Prisma vive en la capa de infraestructura (AGENTS.md
 * secciones 8 y 13). Habla en tipos de dominio y no sabe nada de modelos Prisma,
 * SQL, HTTP ni NestJS.
 *
 * La lista de experiencia del portafolio es un listado pequeño y de solo lectura,
 * así que el puerto expone una sola operación de lectura. Deliberadamente no hay
 * `save`: ningún caso de uso escribe un registro de experiencia aún, y añadir un
 * método de escritura que nadie llama sería especulativo (AGENTS.md sección 18).
 *
 * El orden no forma parte del contrato; la implementación decide un orden estable
 * y de más reciente a más antiguo para que la respuesta HTTP sea determinista.
 */
export interface ExperienceRepository {
  /**
   * EN: Returns every stored experience record.
   * @returns A possibly empty array of detached aggregates.
   *
   * ES: Devuelve todos los registros de experiencia almacenados.
   * @returns Un arreglo, posiblemente vacío, de agregados desacoplados.
   */
  findAll(): Promise<Experience[]>;
}
