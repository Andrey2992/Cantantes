import type { Project } from '../../src/domain/project/entities/Project.js';
import type { ProjectRepository } from '../../src/domain/project/repositories/ProjectRepository.js';
import type { ProjectId } from '../../src/domain/project/value-objects/ProjectId.js';
import type { ProjectSlug } from '../../src/domain/project/value-objects/ProjectSlug.js';

/**
 * In-memory implementation of the domain Project port, used as a test double.
 *
 * It lets use-case and HTTP tests run without PostgreSQL. It is a double for the
 * port, not a fake database: it stores aggregates as given and never applies
 * rules of its own (AGENTS.md section 19).
 */
export class InMemoryProjectRepository implements ProjectRepository {
  private readonly byId = new Map<string, Project>();

  constructor(projects: readonly Project[] = []) {
    for (const project of projects) {
      this.byId.set(project.id.value, project);
    }
  }

  async findById(id: ProjectId): Promise<Project | null> {
    return this.byId.get(id.value) ?? null;
  }

  async findBySlug(slug: ProjectSlug): Promise<Project | null> {
    return (
      [...this.byId.values()].find((project) => project.slug.equals(slug)) ??
      null
    );
  }

  async findAll(): Promise<Project[]> {
    return [...this.byId.values()];
  }

  async save(project: Project): Promise<void> {
    this.byId.set(project.id.value, project);
  }
}
