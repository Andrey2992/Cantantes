import type { Skill } from '../entities/Skill.js';

/**
 * EN: Persistence port for the Skill aggregate.
 *
 * Belongs to the domain; the Prisma implementation lives in infrastructure
 * (AGENTS.md sections 8 and 13). Like {@link ExperienceRepository} it exposes a
 * single read because the skills list is a small, read-only roster and no use
 * case writes a skill yet (AGENTS.md section 18).
 *
 * Ordering is an implementation concern: the implementation groups by category
 * and then by name so the HTTP response is stable.
 *
 * ES: Puerto de persistencia del agregado Skill.
 *
 * Pertenece al dominio; la implementación con Prisma vive en infraestructura
 * (AGENTS.md secciones 8 y 13). Al igual que {@link ExperienceRepository} expone
 * una sola lectura porque la lista de habilidades es un listado pequeño y de solo
 * lectura y ningún caso de uso escribe una habilidad aún (AGENTS.md sección 18).
 *
 * El orden es una preocupación de la implementación: la implementación agrupa por
 * categoría y luego por nombre para que la respuesta HTTP sea estable.
 */
export interface SkillRepository {
  /**
   * EN: Returns every stored skill.
   * @returns A possibly empty array of detached aggregates.
   *
   * ES: Devuelve todas las habilidades almacenadas.
   * @returns Un arreglo, posiblemente vacío, de agregados desacoplados.
   */
  findAll(): Promise<Skill[]>;
}
