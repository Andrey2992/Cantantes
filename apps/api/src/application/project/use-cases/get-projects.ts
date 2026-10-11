import type { Project } from '../../../domain/project/entities/Project.js';
import type { ProjectRepository } from '../../../domain/project/repositories/ProjectRepository.js';

/**
 * EN: Use case — read the whole project roster.
 *
 * It only orchestrates the port; there is no filtering, sorting or reshaping in
 * the application layer. The order comes from the repository, and the HTTP shape
 * is decided by the presentation layer (AGENTS.md section 9).
 *
 * ES: Caso de uso — leer todo el listado de proyectos.
 *
 * Solo orquesta el puerto; no hay filtrado, ordenamiento ni reconfiguración en la
 * capa de aplicación. El orden viene del repositorio y la forma HTTP la decide la
 * capa de presentación (AGENTS.md sección 9).
 */
export class GetProjects {
  constructor(private readonly projects: ProjectRepository) {}

  /**
   * EN: Returns every project.
   * @returns A possibly empty array of domain aggregates. An empty roster is a
   * valid answer, not a failure.
   *
   * ES: Devuelve todos los proyectos.
   * @returns Un arreglo, posiblemente vacío, de agregados de dominio. Un listado
   * vacío es una respuesta válida, no un fallo.
   */
  execute(): Promise<readonly Project[]> {
    return this.projects.findAll();
  }
}
