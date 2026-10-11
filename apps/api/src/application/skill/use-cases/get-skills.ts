import type { Skill } from '../../../domain/skill/entities/Skill.js';
import type { SkillRepository } from '../../../domain/skill/repositories/SkillRepository.js';

/**
 * EN: Use case — read the whole skill roster.
 *
 * Pure orchestration of the port; ordering is a repository concern and the HTTP
 * shape is a presentation concern (AGENTS.md section 9).
 *
 * ES: Caso de uso — leer todo el listado de habilidades.
 *
 * Pura orquestación del puerto; el orden es una preocupación del repositorio y la
 * forma HTTP lo es de la presentación (AGENTS.md sección 9).
 */
export class GetSkills {
  constructor(private readonly skills: SkillRepository) {}

  /**
   * EN: Returns every skill.
   * @returns A possibly empty array of domain aggregates. An empty roster is a
   * valid answer.
   *
   * ES: Devuelve todas las habilidades.
   * @returns Un arreglo, posiblemente vacío, de agregados de dominio. Un listado
   * vacío es una respuesta válida.
   */
  execute(): Promise<readonly Skill[]> {
    return this.skills.findAll();
  }
}
