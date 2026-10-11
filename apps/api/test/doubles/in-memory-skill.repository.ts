import type { Skill } from '../../src/domain/skill/entities/Skill.js';
import type { SkillRepository } from '../../src/domain/skill/repositories/SkillRepository.js';

/**
 * EN: In-memory implementation of the Skill port, used as a test double
 * (AGENTS.md section 19).
 *
 * ES: Implementación en memoria del puerto de Skill, usada como doble de prueba
 * (AGENTS.md sección 19).
 */
export class InMemorySkillRepository implements SkillRepository {
  private readonly items: Skill[];

  constructor(skills: readonly Skill[] = []) {
    this.items = [...skills];
  }

  async findAll(): Promise<Skill[]> {
    return [...this.items];
  }
}
