import { Injectable } from '@nestjs/common';
import { Experience } from '../../domain/experience/entities/Experience.js';
import type { ExperienceRepository } from '../../domain/experience/repositories/ExperienceRepository.js';
import type { Experience as ExperienceModel } from '../../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';

/** EN: A row of the `experiences` table, exactly as Prisma returns it. / ES: Una fila de la tabla `experiences`, tal como la devuelve Prisma. */
type ExperienceRow = ExperienceModel;

/**
 * EN: Prisma adapter for the domain `ExperienceRepository` port.
 *
 * This class is pure mapping. It holds no business rule: every invariant is
 * enforced by `Experience.create()`, so an invalid row fails loudly instead of
 * silently reaching the API (AGENTS.md section 13).
 *
 * Storage-only decisions live here: the snake_case column mapping and a
 * stable, most-recent-first ordering for the read endpoint.
 *
 * ES: Adaptador Prisma del puerto de dominio `ExperienceRepository`.
 *
 * Esta clase es mapeo puro. No guarda ninguna regla de negocio: cada invariante la
 * aplica `Experience.create()` para que una fila inválida falle de forma ruidosa y
 * no llegue en silencio a la API (AGENTS.md sección 13).
 *
 * Las decisiones exclusivamente de almacenamiento viven aquí: el mapeo de columnas
 * snake_case y un orden estable de más reciente a más antiguo para el endpoint de
 * lectura.
 */
@Injectable()
export class PrismaExperienceRepository implements ExperienceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * EN: Loads every stored experience, newest start date first.
   * @returns Detached aggregates, or `[]` when the table is empty.
   *
   * ES: Carga toda la experiencia almacenada, primero la fecha de inicio más
   * reciente.
   * @returns Agregados desacoplados, o `[]` cuando la tabla está vacía.
   */
  async findAll(): Promise<Experience[]> {
    const rows = await this.prisma.experience.findMany({
      orderBy: { startDate: 'desc' },
    });

    return rows.map(toExperience);
  }
}

/**
 * EN: Maps a persistence row to the domain aggregate, re-validating every
 * invariant in the process. Exported separately so the mapping logic is unit
 * testable without a database (AGENTS.md sections 13 and 19).
 *
 * ES: Mapea una fila de persistencia al agregado de dominio, re-validando cada
 * invariante en el proceso. Se exporta por separado para que la lógica de mapeo
 * sea testeable por unidad sin base de datos (AGENTS.md secciones 13 y 19).
 */
export function toExperience(row: ExperienceRow): Experience {
  return Experience.create({
    id: row.id,
    company: row.company,
    role: row.role,
    summary: row.summary,
    period: {
      start: row.startDate,
      end: row.endDate,
    },
  });
}
