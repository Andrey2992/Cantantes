import type { Experience } from '../../../domain/experience/entities/Experience.js';
import type { ExperienceRepository } from '../../../domain/experience/repositories/ExperienceRepository.js';

/**
 * EN: Use case — read the whole experience roster.
 *
 * It only orchestrates the port; there is no filtering, sorting or reshaping in
 * the application layer. The order comes from the repository and the HTTP shape is
 * decided by the presentation layer (AGENTS.md section 9).
 *
 * @example
 * const experiences = await getExperience.execute();
 *
 * ES: Caso de uso — leer todo el listado de experiencia.
 *
 * Solo orquesta el puerto; no hay filtrado, ordenamiento ni reconfiguración en la
 * capa de aplicación. El orden viene del repositorio y la forma HTTP la decide la
 * capa de presentación (AGENTS.md sección 9).
 */
export class GetExperience {
  constructor(private readonly experiences: ExperienceRepository) {}

  /**
   * EN: Returns every experience record.
   * @returns A possibly empty array of domain aggregates. No error is expected:
   * an empty roster is a valid answer, not a failure.
   *
   * ES: Devuelve todos los registros de experiencia.
   * @returns Un arreglo, posiblemente vacío, de agregados de dominio. No se
   * espera error: un listado vacío es una respuesta válida, no un fallo.
   */
  execute(): Promise<readonly Experience[]> {
    return this.experiences.findAll();
  }
}
