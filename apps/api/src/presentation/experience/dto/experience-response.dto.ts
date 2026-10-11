import type { ExperienceResponse } from '@cantantes/types';
import type { Experience } from '../../../domain/experience/entities/Experience.js';

/**
 * EN: Maps a domain aggregate onto the public HTTP contract for `/api/v1/experience`.
 *
 * This is the only place where an Experience becomes a transport shape. It is
 * one-way on purpose: a Prisma model or an entity never crosses the boundary
 * (AGENTS.md sections 11 and 13). Dates are serialized as ISO-8601 so the JSON
 * payload is self-describing and timezone-neutral.
 *
 * ES: Mapea un agregado de dominio al contrato HTTP público de
 * `/api/v1/experience`.
 *
 * Es el único lugar donde una Experience se convierte en forma de transporte. Es
 * unidireccional a propósito: un modelo Prisma o una entidad nunca cruza el
 * límite (AGENTS.md secciones 11 y 13). Las fechas se serializan en ISO-8601 para
 * que el payload JSON sea autodescriptivo y neutro en zona horaria.
 */
export function toExperienceResponse(
  experience: Experience,
): ExperienceResponse {
  return {
    company: experience.companyName.value,
    role: experience.roleTitle.value,
    summary:
      experience.description === null ? null : experience.description.value,
    startDate: experience.timeSpan.start.toISOString(),
    endDate:
      experience.timeSpan.end === null
        ? null
        : experience.timeSpan.end.toISOString(),
  };
}
