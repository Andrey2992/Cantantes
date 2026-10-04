import type { Project } from '../../../domain/project/entities/Project.js';
import type { ProjectRepository } from '../../../domain/project/repositories/ProjectRepository.js';
import type { ProjectSlug } from '../../../domain/project/value-objects/ProjectSlug.js';
import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

/**
 * Use case: read a single project by its public slug.
 *
 * Receives an already-validated `ProjectSlug` value object, so request
 * validation stays in the presentation layer while this class never sees raw
 * input (AGENTS.md sections 9 and 11).
 */
export class GetProject {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(slug: ProjectSlug): Promise<Project> {
    const project = await this.projects.findBySlug(slug);

    if (project === null) {
      throw new ProjectNotFoundError(slug.value);
    }

    return project;
  }
}
