import type { ProjectRepository } from '../../domain/project/repositories/ProjectRepository.js';

/**
 * EN: Injection token for the Project persistence port.
 *
 * The consumer owns the token, so the domain interface stays a plain contract
 * with no framework annotation, and the infrastructure binding stays in the
 * composition root (AGENTS.md sections 8 and 10).
 *
 * ES: Token de inyección del puerto de persistencia de Project.
 *
 * El consumidor posee el token para que la interfaz de dominio siga siendo un
 * contrato simple sin anotaciones de framework, y el enlace de infraestructura
 * permanezca en la raíz de composición (AGENTS.md secciones 8 y 10).
 */
export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export type ProjectRepositoryPort = ProjectRepository;
