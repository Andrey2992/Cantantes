import type { ProjectResponse } from '@cantantes/types';
import type { Project } from '../../../domain/project/entities/Project.js';

/**
 * EN: Maps a domain aggregate onto the public HTTP contract.
 *
 * This is the only place where domain objects become transport shapes. It is
 * deliberately one-way: a Prisma model or an entity never crosses the boundary
 * (AGENTS.md sections 11 and 13).
 *
 * The contract (`@cantantes/types`) is owned by the API and consumed by the web
 * app. It exposes only what the Stitch PRD consumes: the index text (3.2) and
 * the per-state gradient (3.4).
 *
 * ES: Mapea un agregado de dominio al contrato HTTP público.
 *
 * Es el único lugar donde los objetos de dominio se vuelven formas de transporte.
 * Es deliberadamente unidireccional: un modelo Prisma o una entidad nunca cruza el
 * límite (AGENTS.md secciones 11 y 13).
 *
 * El contrato (`@cantantes/types`) lo posee la API y lo consume la app web. Expone
 * solo lo que consume el Stitch PRD: el texto del índice (3.2) y el degradado por
 * estado (3.4).
 */
export function toProjectResponse(project: Project): ProjectResponse {
  return {
    slug: project.slug.value,
    title: project.title.value,
    theme: {
      from: project.theme.from,
      to: project.theme.to,
      accent: project.theme.accent,
    },
  };
}
