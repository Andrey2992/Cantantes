import type { SkillRepository } from '../../domain/skill/repositories/SkillRepository.js';

/**
 * EN: Injection token for the Skill persistence port, following the same
 * convention as `PROJECT_REPOSITORY` (AGENTS.md sections 8 and 10).
 *
 * ES: Token de inyección del puerto de persistencia de Skill, siguiendo la misma
 * convención que `PROJECT_REPOSITORY` (AGENTS.md secciones 8 y 10).
 */
export const SKILL_REPOSITORY = Symbol('SKILL_REPOSITORY');

export type SkillRepositoryPort = SkillRepository;
