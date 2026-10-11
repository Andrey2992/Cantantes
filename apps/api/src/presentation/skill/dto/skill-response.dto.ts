import type { SkillResponse } from '@cantantes/types';
import type { Skill } from '../../../domain/skill/entities/Skill.js';

/**
 * EN: Maps a domain aggregate onto the public HTTP contract for `/api/v1/skills`.
 *
 * One-way mapping, like every response mapper: a Prisma model or an entity never
 * crosses this boundary (AGENTS.md sections 11 and 13).
 *
 * ES: Mapea un agregado de dominio al contrato HTTP público de `/api/v1/skills`.
 *
 * Mapeo unidireccional, como todo mapeador de respuesta: un modelo Prisma o una
 * entidad nunca cruza este límite (AGENTS.md secciones 11 y 13).
 */
export function toSkillResponse(skill: Skill): SkillResponse {
  return {
    name: skill.name.value,
    category: skill.category === null ? null : skill.category.value,
  };
}
