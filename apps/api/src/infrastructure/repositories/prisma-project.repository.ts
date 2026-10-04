import { Injectable } from '@nestjs/common';
import type { Project as ProjectModel } from '../../generated/prisma/client.js';
import { Project } from '../../domain/project/entities/Project.js';
import type { ProjectId } from '../../domain/project/value-objects/ProjectId.js';
import type { ProjectSlug } from '../../domain/project/value-objects/ProjectSlug.js';
import type { ProjectRepository } from '../../domain/project/repositories/ProjectRepository.js';
import { PrismaService } from '../database/prisma.service.js';

/** A row of the `projects` table, exactly as Prisma returns it. */
type ProjectRow = ProjectModel;

/** Columns derived from the domain aggregate. */
type ProjectColumns = {
  id: string;
  slug: string;
  title: string;
  themeFrom: string;
  themeTo: string;
  themeAccent: string;
};

/**
 * Prisma adapter for the domain `ProjectRepository` port.
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
 */
@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ProjectId): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { id: id.value },
    });

    return row === null ? null : toDomain(row);
  }

  async findBySlug(slug: ProjectSlug): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { slug: slug.value },
    });

    return row === null ? null : toDomain(row);
  }

  async findAll(): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(toDomain);
  }

  /**
   * Upsert of the whole aggregate. Not reachable from any HTTP route yet: the
   * API exposes read operations only.
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
