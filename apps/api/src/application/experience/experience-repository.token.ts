import type { ExperienceRepository } from '../../domain/experience/repositories/ExperienceRepository.js';

/**
 * EN: Injection token for the Experience persistence port.
 *
 * The consumer owns the token so the domain interface stays a plain contract with
 * no framework annotation, and the infrastructure binding stays in the composition
 * root (AGENTS.md sections 8 and 10). Same convention as
 * `PROJECT_REPOSITORY`.
 *
 * ES: Token de inyección del puerto de persistencia de Experience.
 *
 * El consumidor posee el token para que la interfaz de dominio siga siendo un
 * contrato simple sin anotaciones de framework, y el enlace de infraestructura
 * permanezca en la raíz de composición (AGENTS.md secciones 8 y 10). Misma
 * convención que `PROJECT_REPOSITORY`.
 */
export const EXPERIENCE_REPOSITORY = Symbol('EXPERIENCE_REPOSITORY');

export type ExperienceRepositoryPort = ExperienceRepository;
