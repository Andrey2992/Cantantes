import type { ProjectRepository } from '../../domain/project/repositories/ProjectRepository.js';

/**
 * Injection token for the Project persistence port.
 *
 * The consumer owns the token, so the domain interface stays a plain contract
 * with no framework annotation, and the infrastructure binding stays in the
 * composition root (AGENTS.md sections 8 and 10).
 */
export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export type ProjectRepositoryPort = ProjectRepository;
