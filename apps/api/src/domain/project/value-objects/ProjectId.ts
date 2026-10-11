import { DomainError } from '../../shared/errors/DomainError.js';

const MAX_LENGTH = 64;

/**
 * EN: Opaque identity of a Project.
 *
 * The domain treats the identifier as an opaque string: it never parses it,
 * never derives meaning from it, and never generates it. Whoever persists a
 * project decides how the identifier is produced (AGENTS.md section 8: the
 * domain owns invariants, infrastructure owns storage concerns).
 *
 * Rule enforced: an identifier is a single, non-empty, bounded token. An empty
 * or whitespace-bearing identifier would make repository lookups silently miss
 * instead of failing loudly.
 *
 * ES: Identidad opaca de un Project.
 *
 * El dominio trata el identificador como una cadena opaca: nunca lo analiza,
 * nunca deriva significado de él y nunca lo genera. Quien persiste un proyecto
 * decide cómo se produce el identificador (AGENTS.md sección 8: el dominio posee
 * las invariantes, la infraestructura posee los detalles de almacenamiento).
 *
 * Regla aplicada: un identificador es un token único, no vacío y acotado. Un
 * identificador vacío o con espacios haría que las búsquedas del repositorio
 * fallaran en silencio en lugar de fallar de forma ruidosa.
 */
export class ProjectId {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates a raw identifier and wraps it.
   * @param raw Candidate identifier. Trimmed before validation.
   * @returns A valid `ProjectId`.
   * @throws {DomainError} If it is not a string, is empty, contains whitespace or
   * exceeds the bound.
   *
   * ES: Valida un identificador crudo y lo envuelve.
   * @param raw Identificador candidato. Se recorta antes de validar.
   * @returns Un `ProjectId` válido.
   * @throws {DomainError} Si no es una cadena, está vacío, contiene espacios o
   * supera el límite.
   */
  static of(raw: string): ProjectId {
    if (typeof raw !== 'string') {
      throw new DomainError('ProjectId must be a string');
    }

    const value = raw.trim();

    if (value.length === 0) {
      throw new DomainError('ProjectId must not be empty');
    }

    if (/\s/.test(value)) {
      throw new DomainError('ProjectId must not contain whitespace');
    }

    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `ProjectId must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new ProjectId(value);
  }

  equals(other: ProjectId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
