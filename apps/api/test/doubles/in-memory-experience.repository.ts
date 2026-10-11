import type { Experience } from '../../src/domain/experience/entities/Experience.js';
import type { ExperienceRepository } from '../../src/domain/experience/repositories/ExperienceRepository.js';

/**
 * EN: In-memory implementation of the Experience port, used as a test double.
 *
 * It lets use-case and HTTP tests run without PostgreSQL. Like the Project
 * double, it stores aggregates as given and never applies rules of its own
 * (AGENTS.md section 19).
 *
 * ES: Implementación en memoria del puerto de Experience, usada como doble de
 * prueba.
 *
 * Permite que los casos de uso y las pruebas HTTP corran sin PostgreSQL. Como el
 * doble de Project, almacena los agregados tal como se le dan y nunca aplica
 * reglas propias (AGENTS.md sección 19).
 */
export class InMemoryExperienceRepository implements ExperienceRepository {
  private readonly items: Experience[];

  constructor(experiences: readonly Experience[] = []) {
    this.items = [...experiences];
  }

  async findAll(): Promise<Experience[]> {
    return [...this.items];
  }
}
