import type { Project } from '../entities/Project.js';
import type { ProjectId } from '../value-objects/ProjectId.js';
import type { ProjectSlug } from '../value-objects/ProjectSlug.js';

/**
 * Persistence port for the Project aggregate.
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
 */
export interface ProjectRepository {
  findById(id: ProjectId): Promise<Project | null>;

  findBySlug(slug: ProjectSlug): Promise<Project | null>;

  findAll(): Promise<Project[]>;

  save(project: Project): Promise<void>;
}
