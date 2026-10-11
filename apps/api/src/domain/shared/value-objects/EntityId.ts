import { DomainError } from '../errors/DomainError.js';

const MAX_LENGTH = 64;

/**
 * EN: Opaque identity shared by the aggregates that store their own row key
 * (Experience, Skill, ContactMessage).
 *
 * The domain treats an identifier as an opaque string: it never parses it, never
 * derives meaning from it and never generates it. Whoever persists an aggregate
 * decides how the identifier is produced (AGENTS.md section 8: the domain owns
 * invariants, infrastructure owns storage concerns).
 *
 * Rule enforced: a single, non-empty, whitespace-free, bounded token. An empty
 * or whitespace-bearing identifier would make repository lookups silently miss
 * instead of failing loudly.
 *
 * It intentionally coexists with `ProjectId`: the Project aggregate predates this
 * shared primitive and keeps its bespoke value object, which carries the same
 * rules. New aggregates use this one instead of re-implementing it.
 *
 * ES: Identidad opaca compartida por los agregados que almacenan su propia clave
 * de fila (Experience, Skill, ContactMessage).
 *
 * El dominio trata un identificador como una cadena opaca: nunca lo analiza,
 * nunca deriva significado de él y nunca lo genera. Quien persiste un agregado
 * decide cómo se produce el identificador (AGENTS.md sección 8: el dominio posee
 * las invariantes, la infraestructura posee los detalles de almacenamiento).
 *
 * Regla aplicada: un token único, no vacío, sin espacios y acotado. Un
 * identificador vacío o con espacios haría que las búsquedas del repositorio
 * fallaran en silencio en lugar de fallar de forma ruidosa.
 *
 * Convive a propósito con `ProjectId`: el agregado Project es anterior a esta
 * primitiva compartida y conserva su value object propio, con las mismas reglas.
 * Los agregados nuevos usan este en lugar de reimplementarlo.
 */
export class EntityId {
  private constructor(readonly value: string) {}

  /**
   * EN: Validates a raw identifier and wraps it.
   * @param raw Candidate identifier. Trimmed before validation.
   * @returns A valid `EntityId`.
   * @throws {DomainError} If it is not a string, is empty, contains whitespace or
   * exceeds {@link MAX_LENGTH} characters.
   *
   * ES: Valida un identificador crudo y lo envuelve.
   * @param raw Identificador candidato. Se recorta antes de validar.
   * @returns Un `EntityId` válido.
   * @throws {DomainError} Si no es una cadena, está vacío, contiene espacios o
   * supera los {@link MAX_LENGTH} caracteres.
   */
  static of(raw: string): EntityId {
    if (typeof raw !== 'string') {
      throw new DomainError('EntityId must be a string');
    }

    const value = raw.trim();

    if (value.length === 0) {
      throw new DomainError('EntityId must not be empty');
    }

    if (/\s/.test(value)) {
      throw new DomainError('EntityId must not contain whitespace');
    }

    if (value.length > MAX_LENGTH) {
      throw new DomainError(
        `EntityId must be at most ${MAX_LENGTH} characters`,
      );
    }

    return new EntityId(value);
  }

  /** EN: Value equality. / ES: Igualdad por valor. */
  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  /** EN: Serializable form. / ES: Forma serializable. */
  toString(): string {
    return this.value;
  }
}
