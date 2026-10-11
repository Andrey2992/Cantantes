import { Injectable } from '@nestjs/common';
import type { Skill as SkillModel } from '../../generated/prisma/client.js';
import { Skill } from '../../domain/skill/entities/Skill.js';
import type { SkillRepository } from '../../domain/skill/repositories/SkillRepository.js';
import { PrismaService } from '../database/prisma.service.js';

/** EN: A row of the `skills` table, exactly as Prisma returns it. / ES: Una fila de la tabla `skills`, tal como la devuelve Prisma. */
type SkillRow = SkillModel;

/**
 * EN: Prisma adapter for the domain `SkillRepository` port.
 *
 * Pure mapping: every invariant is enforced by `Skill.create()`, so an invalid
 * row fails loudly (AGENTS.md section 13). The only storage decision here is a
 * stable ordering that groups by category and then by name.
 *
 * ES: Adaptador Prisma del puerto de dominio `SkillRepository`.
 *
 * Mapeo puro: cada invariante la aplica `Skill.create()` para que una fila
 * inválida falle de forma ruidosa (AGENTS.md sección 13). La única decisión de
 * almacenamiento aquí es un orden estable que agrupa por categoría y luego por
 * nombre.
 */
@Injectable()
export class PrismaSkillRepository implements SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * EN: Loads every stored skill, grouped by category and then alphabetical.
   * @returns Detached aggregates, or `[]` when the table is empty.
   *
   * ES: Carga todas las habilidades almacenadas, agrupadas por categoría y luego
   * alfabéticas.
   * @returns Agregados desacoplados, o `[]` cuando la tabla está vacía.
   */
  async findAll(): Promise<Skill[]> {
    const rows = await this.prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return rows.map(toSkill);
  }
}

/**
 * EN: Maps a persistence row to the domain aggregate, re-validating every
 * invariant. Exported so the mapping logic is unit testable (AGENTS.md sections
 * 13 and 19).
 *
 * ES: Mapea una fila de persistencia al agregado de dominio, re-validando cada
 * invariante. Se exporta para que la lógica de mapeo sea testeable por unidad
 * (AGENTS.md secciones 13 y 19).
 */
export function toSkill(row: SkillRow): Skill {
  return Skill.create({
    id: row.id,
    name: row.name,
    category: row.category,
  });
}
