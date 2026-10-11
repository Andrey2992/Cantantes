import type { Project } from '../../../domain/project/entities/Project.js';
import type { ProjectRepository } from '../../../domain/project/repositories/ProjectRepository.js';
import type { ProjectSlug } from '../../../domain/project/value-objects/ProjectSlug.js';
import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

/**
 * EN: Use case — read a single project by its public slug.
 *
 * Receives an already-validated `ProjectSlug` value object, so request
 * validation stays in the presentation layer while this class never sees raw
 * input (AGENTS.md sections 9 and 11).
 *
 * ES: Caso de uso — leer un único proyecto por su slug público.
 *
 * Recibe un value object `ProjectSlug` ya validado, así que la validación de la
 * petición permanece en la capa de presentación mientras esta clase nunca ve
 * entrada cruda (AGENTS.md secciones 9 y 11).
 */
export class GetProject {
  constructor(private readonly projects: ProjectRepository) {}

  /**
   * EN: Looks the project up by slug.
   * @param slug Validated public slug.
   * @returns The matching aggregate.
   * @throws {ProjectNotFoundError} When no project has that slug.
   *
   * ES: Busca el proyecto por slug.
   * @param slug Slug público ya validado.
   * @returns El agregado correspondiente.
   * @throws {ProjectNotFoundError} Cuando ningún proyecto tiene ese slug.
   */
  async execute(slug: ProjectSlug): Promise<Project> {
    const project = await this.projects.findBySlug(slug);

    if (project === null) {
      throw new ProjectNotFoundError(slug.value);
    }

    return project;
  }
}
