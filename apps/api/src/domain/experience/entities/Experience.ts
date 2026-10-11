import { EntityId } from '../../shared/value-objects/EntityId.js';
import { ShortText } from '../../shared/value-objects/ShortText.js';
import { LongText } from '../../shared/value-objects/LongText.js';
import {
  ExperiencePeriod,
  type ExperiencePeriodProps,
} from '../value-objects/ExperiencePeriod.js';

/**
 * EN: Raw shape accepted by the aggregate entry point. Primitives (not value
 * objects) on purpose, so the persistence mapper can hydrate an entity from a
 * database row while the entity still validates every invariant.
 *
 * ES: Forma cruda aceptada por el punto de entrada del agregado. Primitivas (no
 * value objects) a propósito, para que el mapeador de persistencia pueda hidratar
 * una entidad desde una fila de base de datos mientras la entidad sigue validando
 * cada invariante.
 */
export type ExperienceProps = {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  /** EN: Optional description. Empty/`null` is stored as `null`. / ES: Descripción opcional. Vacío/`null` se guarda como `null`. */
  readonly summary?: string | null;
  readonly period: ExperiencePeriodProps;
};

/** EN: Maximum length of a company name. / ES: Longitud máxima de un nombre de empresa. */
const COMPANY_MAX_LENGTH = 120;
/** EN: Maximum length of a role title. / ES: Longitud máxima de un título de cargo. */
const ROLE_MAX_LENGTH = 160;
/** EN: Maximum length of the summary. / ES: Longitud máxima del resumen. */
const SUMMARY_MAX_LENGTH = 2000;

/**
 * EN: A professional experience record of the portfolio owner.
 *
 * Design notes:
 * - The constructor is private. Instances exist only through `create`, so no
 *   caller can build an Experience that skipped validation.
 * - There is a single factory (`create`) instead of the `create`/`restore` pair
 *   used by Project: this aggregate holds no persistence-only state (no
 *   timestamps), so hydration and creation apply exactly the same rules and a
 *   second factory would be redundant.
 * - It is read-only from the API's point of view: the record has no behaviour
 *   methods because no use case changes it yet (AGENTS.md section 18: no
 *   speculative behaviour).
 * - It depends only on its own value objects. No NestJS, no Prisma, no HTTP
 *   (AGENTS.md section 8).
 *
 * Content policy: the domain validates the shape of an experience record but
 * never invents one. Records only enter the database through an authoring
 * migration or a future write path (AGENTS.md section 23).
 *
 * ES: Un registro de experiencia profesional del dueño del portafolio.
 *
 * Notas de diseño:
 * - El constructor es privado. Las instancias solo existen a través de `create`,
 *   así que ningún llamador puede construir una Experience que omitió la
 *   validación.
 * - Hay una sola fábrica (`create`) en lugar del par `create`/`restore` que usa
 *   Project: este agregado no guarda estado exclusivo de persistencia (sin marcas
 *   de tiempo), así que hidratar y crear aplican exactamente las mismas reglas y
 *   una segunda fábrica sería redundante.
 * - Es de solo lectura desde el punto de vista de la API: el registro no tiene
 *   métodos de comportamiento porque ningún caso de uso lo modifica aún
 *   (AGENTS.md sección 18: sin comportamiento especulativo).
 * - Depende solo de sus propios value objects. Sin NestJS, sin Prisma, sin HTTP
 *   (AGENTS.md sección 8).
 *
 * Política de contenido: el dominio valida la forma de un registro de experiencia
 * pero nunca lo inventa. Los registros solo entran a la base de datos mediante una
 * migración de autoría o un futuro camino de escritura (AGENTS.md sección 23).
 */
export class Experience {
  readonly id: EntityId;

  private readonly company: ShortText;
  private readonly role: ShortText;
  private readonly summary: LongText | null;
  private readonly period: ExperiencePeriod;

  private constructor(params: {
    id: EntityId;
    company: ShortText;
    role: ShortText;
    summary: LongText | null;
    period: ExperiencePeriod;
  }) {
    this.id = params.id;
    this.company = params.company;
    this.role = params.role;
    this.summary = params.summary;
    this.period = params.period;
  }

  /**
   * EN: Builds a validated experience record. It is also used by the persistence
   * mapper to rehydrate a row, because the aggregate has no state that only
   * storage knows about.
   * @param props Raw primitives, see {@link ExperienceProps}.
   * @returns A valid `Experience`.
   * @throws {DomainError} If any primitive violates its value-object rule.
   *
   * ES: Construye un registro de experiencia validado. También lo usa el mapeador
   * de persistencia para rehidratar una fila, porque el agregado no tiene estado
   * que solo conozca el almacenamiento.
   * @param props Primitivas crudas, ver {@link ExperienceProps}.
   * @returns Una `Experience` válida.
   * @throws {DomainError} Si alguna primitiva viola la regla de su value object.
   */
  static create(props: ExperienceProps): Experience {
    const rawSummary = props.summary ?? null;
    const summary =
      rawSummary === null || rawSummary.trim() === ''
        ? null
        : LongText.of(rawSummary, {
            field: 'Experience summary',
            maxLength: SUMMARY_MAX_LENGTH,
          });

    return new Experience({
      id: EntityId.of(props.id),
      company: ShortText.of(props.company, {
        field: 'Experience company',
        maxLength: COMPANY_MAX_LENGTH,
      }),
      role: ShortText.of(props.role, {
        field: 'Experience role',
        maxLength: ROLE_MAX_LENGTH,
      }),
      summary,
      period: ExperiencePeriod.of(props.period),
    });
  }

  /** EN: Company name. / ES: Nombre de la empresa. */
  get companyName(): ShortText {
    return this.company;
  }

  /** EN: Role title. / ES: Título del cargo. */
  get roleTitle(): ShortText {
    return this.role;
  }

  /** EN: Description, or `null` when absent. / ES: Descripción, o `null` cuando no existe. */
  get description(): LongText | null {
    return this.summary;
  }

  /** EN: Time span of the record. / ES: Intervalo temporal del registro. */
  get timeSpan(): ExperiencePeriod {
    return this.period;
  }

  /** EN: Identity-based equality. / ES: Igualdad basada en la identidad. */
  equals(other: Experience): boolean {
    return this.id.equals(other.id);
  }
}
