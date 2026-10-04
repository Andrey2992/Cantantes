import type { Project } from '../../../domain/project/entities/Project.js';
import type { ProjectRepository } from '../../../domain/project/repositories/ProjectRepository.js';

/**
 * Use case: read the whole project roster.
 *
 * It only orchestrates the port; there is no filtering, sorting or reshaping in
 * the application layer. The order comes from the repository, and the HTTP shape
 * is decided by the presentation layer (AGENTS.md section 9).
 */
export class GetProjects {
  constructor(private readonly projects: ProjectRepository) {}

  execute(): Promise<readonly Project[]> {
    return this.projects.findAll();
  }
}
