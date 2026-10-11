import type { Project } from '../entities/Project.js';
import type { ProjectId } from '../value-objects/ProjectId.js';
import type { ProjectSlug } from '../value-objects/ProjectSlug.js';

/**
 * EN: Persistence port for the Project aggregate.
 *
 * This interface belongs to the domain: use cases depend on it, the Prisma
 * implementation lives in the infrastructure layer (AGENTS.md sections 8 and 13).
 * It therefore speaks in domain types and knows nothing about Prisma models,
 * transactions, SQL, HTTP or NestJS.
 *
 * Contract notes:
 * - Implementations return detached aggregates. Callers may mutate the returned
 *   entity freely; nothing is tracked or flushed implicitly.
 * - `save` upserts: the aggregate owns its invariants, so the implementation is
 *   responsible for persisting a consistent whole, never a partial diff.
 * - Ordering and filtering are not part of this port. Deciding which projects a
 *   consumer may see is a use-case decision, not a storage concern.
 *
 * ES: Puerto de persistencia del agregado Project.
 *
 * Esta interfaz pertenece al dominio: los casos de uso dependen de ella y la
 * implementación con Prisma vive en la capa de infraestructura (AGENTS.md
 * secciones 8 y 13). Por eso habla en tipos de dominio y no sabe nada de modelos
 * Prisma, transacciones, SQL, HTTP ni NestJS.
 *
 * Notas del contrato:
 * - Las implementaciones devuelven agregados desacoplados. Los llamadores pueden
 *   mutar la entidad devuelta con libertad; nada se rastrea ni se vuelca de forma
 *   implícita.
 * - `save` hace upsert: el agregado posee sus invariantes, así que la
 *   implementación es responsable de persistir un todo consistente, nunca un diff
 *   parcial.
 * - El orden y el filtrado no forman parte de este puerto. Decidir qué proyectos
 *   puede ver un consumidor es una decisión del caso de uso, no del
 *   almacenamiento.
 */
export interface ProjectRepository {
  /**
   * EN: Finds a project by internal identity.
   * @param id The aggregate identity.
   * @returns The matching aggregate or `null` when it does not exist.
   *
   * ES: Busca un proyecto por identidad interna.
   * @param id La identidad del agregado.
   * @returns El agregado correspondiente o `null` cuando no existe.
   */
  findById(id: ProjectId): Promise<Project | null>;

  /**
   * EN: Finds a project by its public slug.
   * @param slug The canonical route identity.
   * @returns The matching aggregate or `null` when it does not exist.
   *
   * ES: Busca un proyecto por su slug público.
   * @param slug La identidad de ruta canónica.
   * @returns El agregado correspondiente o `null` cuando no existe.
   */
  findBySlug(slug: ProjectSlug): Promise<Project | null>;

  /**
   * EN: Returns every stored project in the order the implementation chooses.
   * @returns A possibly empty array of detached aggregates.
   *
   * ES: Devuelve todos los proyectos almacenados en el orden que elija la
   * implementación.
   * @returns Un arreglo, posiblemente vacío, de agregados desacoplados.
   */
  findAll(): Promise<Project[]>;

  /**
   * EN: Upserts the whole aggregate.
   * @param project The aggregate to persist. The implementation maps every field,
   * never a partial diff.
   *
   * ES: Hace upsert del agregado completo.
   * @param project El agregado a persistir. La implementación mapea cada campo,
   * nunca un diff parcial.
   */
  save(project: Project): Promise<void>;
}
