import { Injectable } from '@nestjs/common';
import type { Project as ProjectModel } from '../../generated/prisma/client.js';
import { Project } from '../../domain/project/entities/Project.js';
import type { ProjectId } from '../../domain/project/value-objects/ProjectId.js';
import type { ProjectSlug } from '../../domain/project/value-objects/ProjectSlug.js';
import type { ProjectRepository } from '../../domain/project/repositories/ProjectRepository.js';
import { PrismaService } from '../database/prisma.service.js';

/** EN: A row of the `projects` table, exactly as Prisma returns it. / ES: Una fila de la tabla `projects`, tal como la devuelve Prisma. */
type ProjectRow = ProjectModel;

/** EN: Columns derived from the domain aggregate. / ES: Columnas derivadas del agregado de dominio. */
type ProjectColumns = {
  id: string;
  slug: string;
  title: string;
  themeFrom: string;
  themeTo: string;
  themeAccent: string;
};

/**
 * EN: Prisma adapter for the domain `ProjectRepository` port.
 *
 * This class is pure mapping. It holds no business rule: every invariant is
 * enforced by `Project.restore()` / `Project.create()`, so an invalid row fails
 * loudly instead of being silently persisted (AGENTS.md section 13).
 *
 * Storage-only decisions live here:
 * - column names and their snake_case mapping;
 * - `created_at` ordering for the read APIs. The roster order of the Stitch PRD
 *   (section 3.2) is not modelled yet; when it becomes authored data it will be
 *   an explicit `position` column plus a domain rule, added in its own migration.
 *
 * ES: Adaptador Prisma del puerto de dominio `ProjectRepository`.
 *
 * Esta clase es mapeo puro. No guarda ninguna regla de negocio: cada invariante la
 * aplica `Project.restore()` / `Project.create()`, así que una fila inválida falla
 * de forma ruidosa en lugar de persistirse en silencio (AGENTS.md sección 13).
 *
 * Las decisiones exclusivamente de almacenamiento viven aquí:
 * - los nombres de columna y su mapeo snake_case;
 * - el orden por `created_at` para las APIs de lectura. El orden del listado del
 *   Stitch PRD (sección 3.2) todavía no está modelado; cuando sea dato de autoría
 *   será una columna `position` explícita más una regla de dominio, añadidas en su
 *   propia migración.
 */
@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** EN: Finds a project by internal id. / ES: Busca un proyecto por id interno. */
  async findById(id: ProjectId): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { id: id.value },
    });

    return row === null ? null : toDomain(row);
  }

  /** EN: Finds a project by public slug. / ES: Busca un proyecto por slug público. */
  async findBySlug(slug: ProjectSlug): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { slug: slug.value },
    });

    return row === null ? null : toDomain(row);
  }

  /** EN: Lists every project, oldest first. / ES: Lista todos los proyectos, del más antiguo al más nuevo. */
  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(toDomain);
  }

  /**
   * EN: Upsert of the whole aggregate. Not reachable from any HTTP route yet: the
   * API exposes read operations only.
   *
   * ES: Upsert del agregado completo. Todavía no es alcanzable desde ninguna ruta
   * HTTP: la API expone solo operaciones de lectura.
   */
  async save(project: Project): Promise<void> {
    const columns = toColumns(project);

    await this.prisma.project.upsert({
      where: { id: columns.id },
      create: { ...columns, createdAt: project.createdAt },
      update: {
        slug: columns.slug,
        title: columns.title,
        themeFrom: columns.themeFrom,
        themeTo: columns.themeTo,
        themeAccent: columns.themeAccent,
        updatedAt: project.updatedAt,
      },
    });
  }
}

/**
 * EN: Maps a persistence row to the domain aggregate, re-validating every
 * invariant in the process.
 *
 * ES: Mapea una fila de persistencia al agregado de dominio, re-validando cada
 * invariante en el proceso.
 */
function toDomain(row: ProjectRow): Project {
  return Project.restore({
    id: row.id,
    slug: row.slug,
    title: row.title,
    theme: {
      from: row.themeFrom,
      to: row.themeTo,
      accent: row.themeAccent,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

/**
 * EN: Maps the domain aggregate to its persistence columns.
 *
 * ES: Mapea el agregado de dominio a sus columnas de persistencia.
 */
function toColumns(project: Project): ProjectColumns {
  return {
    id: project.id.value,
    slug: project.slug.value,
    title: project.title.value,
    themeFrom: project.theme.from,
    themeTo: project.theme.to,
    themeAccent: project.theme.accent,
  };
}
