import { DomainError } from '../../shared/errors/DomainError.js';
import type { ProjectTitle } from './ProjectTitle.js';

const MAX_LENGTH = 80;
const CANONICAL_FORM = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Combining diacritical marks, removed after an NFD decomposition so that
// "SÁNCHEZ" and "SANCHEZ" cannot produce two different slugs for one project.
const COMBINING_MARKS = /\p{M}/gu;

/**
 * EN: Stable, canonical URL identity of a Project.
 *
 * Justified by the Stitch PRD roadmap (section 6, Phase 6): projects get their
 * own deep-dive pages, which means each project needs a route identity that is
 * stable across renames and comparable across projects. Folding case and accents
 * into one canonical form prevents two projects from being reachable through
 * visually identical but distinct URLs.
 *
 * Production policy: derived from the title by default, explicitly overridable.
 * Uniqueness is not asserted here — that requires a storage lookup and therefore
 * belongs to the repository, not to the value object (AGENTS.md section 8).
 *
 * ES: Identidad de URL estable y canónica de un Project.
 *
 * Justificada por la hoja de ruta del Stitch PRD (sección 6, Fase 6): los
 * proyectos tienen sus propias páginas de detalle, lo que significa que cada
 * proyecto necesita una identidad de ruta estable entre renombrados y comparable
 * entre proyectos. Plegar mayúsculas y acentos en una única forma canónica evita
 * que dos proyectos sean alcanzables mediante URLs visualmente idénticas pero
 * distintas.
 *
 * Política de producción: derivada del título por defecto, sobrescribible de forma
 * explícita. La unicidad no se afirma aquí — requiere una consulta al
 * almacenamiento y por tanto pertenece al repositorio, no al value object
 * (AGENTS.md sección 8).
 */
export class ProjectSlug {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates an already-canonical slug. Strict on purpose: normalizing
   * silently would let two callers believe they produced the same route.
   * @param raw Candidate slug, expected in lowercase kebab-case.
   * @returns A valid `ProjectSlug`.
   * @throws {DomainError} If it is empty, not canonical, or too long.
   *
   * ES: Valida un slug que ya es canónico. Estricto a propósito: normalizar en
   * silencio dejaría que dos llamadores creyeran que produjeron la misma ruta.
   * @param raw Slug candidato, esperado en kebab-case minúsculas.
   * @returns Un `ProjectSlug` válido.
   * @throws {DomainError} Si está vacío, no es canónico o es demasiado largo.
   */
  static of(raw: string): ProjectSlug {
    if (typeof raw !== 'string') {
      throw new DomainError('ProjectSlug must be a string');
    }

    if (raw.length === 0) {
      throw new DomainError('ProjectSlug must not be empty');
    }

    if (!CANONICAL_FORM.test(raw)) {
      throw new DomainError(
        'ProjectSlug must be lowercase kebab-case (a-z, 0-9, single hyphens)',
      );
    }

    if (raw.length > MAX_LENGTH) {
      throw new DomainError(
        `ProjectSlug must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new ProjectSlug(raw);
  }

  /**
   * EN: Derives a canonical slug from a title: decompose, drop diacritics,
   * lowercase, collapse every run of non-alphanumeric characters into a single
   * hyphen, then trim leading and trailing hyphens.
   *
   * The result can never exceed `ProjectTitle`'s own bound (every run of
   * characters maps to at most one hyphen), so it needs no length check here.
   *
   * @param title Source title, already validated.
   * @returns A canonical `ProjectSlug`.
   * @throws {DomainError} If the title has no URL-safe character.
   *
   * ES: Deriva un slug canónico a partir de un título: descompone, quita
   * diacríticos, pasa a minúsculas, colapsa cada secuencia de caracteres no
   * alfanuméricos en un solo guion y luego recorta los guiones iniciales y
   * finales.
   *
   * El resultado nunca puede superar el límite de `ProjectTitle` (cada secuencia
   * de caracteres mapea a lo sumo a un guion), así que no necesita comprobación de
   * longitud aquí.
   *
   * @param title Título de origen, ya validado.
   * @returns Un `ProjectSlug` canónico.
   * @throws {DomainError} Si el título no tiene ningún carácter seguro para URL.
   */
  static fromTitle(title: ProjectTitle): ProjectSlug {
    const candidate = title.value
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (candidate.length === 0) {
      throw new DomainError(
        'ProjectSlug cannot be derived from the given title',
      );
    }

    return new ProjectSlug(candidate);
  }

  equals(other: ProjectSlug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
