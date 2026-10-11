import { EntityId } from '../../shared/value-objects/EntityId.js';
import { ShortText } from '../../shared/value-objects/ShortText.js';

/**
 * EN: Raw shape accepted by the aggregate entry point, mirroring the persistence
 * row so the mapper can hydrate straight from storage.
 *
 * ES: Forma cruda aceptada por el punto de entrada del agregado, análoga a la
 * fila de persistencia para que el mapeador pueda hidratar directo desde el
 * almacenamiento.
 */
export type SkillProps = {
  readonly id: string;
  readonly name: string;
  /** EN: Optional grouping label. Empty/`null` is stored as `null`. / ES: Etiqueta de agrupación opcional. Vacío/`null` se guarda como `null`. */
  readonly category?: string | null;
};

/** EN: Maximum length of a skill name. / ES: Longitud máxima de un nombre de habilidad. */
const NAME_MAX_LENGTH = 80;
/** EN: Maximum length of a category label. / ES: Longitud máxima de una etiqueta de categoría. */
const CATEGORY_MAX_LENGTH = 60;

/**
 * EN: A skill listed in the portfolio.
 *
 * Design notes:
 * - Private constructor and a single `create` factory: the same validation runs
 *   for a new skill and for a row loaded from storage, because the aggregate
 *   holds no persistence-only state.
 * - A skill is intentionally minimal (a name and an optional category). It does
 *   not model a proficiency level or a self-assessment: the portfolio does not
 *   publish qualification claims, and inventing a scale would be misleading
 *   (AGENTS.md section 23).
 * - The domain validates the shape of a skill but never invents one. Entries
 *   enter through an authoring migration (AGENTS.md section 23).
 * - No NestJS, no Prisma, no HTTP (AGENTS.md section 8).
 *
 * ES: Una habilidad listada en el portafolio.
 *
 * Notas de diseño:
 * - Constructor privado y una sola fábrica `create`: la misma validación corre
 *   para una habilidad nueva y para una fila cargada del almacenamiento, porque
 *   el agregado no guarda estado exclusivo de persistencia.
 * - Una habilidad es intencionalmente mínima (un nombre y una categoría
 *   opcional). No modela un nivel de dominio ni una autoevaluación: el portafolio
 *   no publica afirmaciones de cualificación e inventar una escala sería
 *   engañoso (AGENTS.md sección 23).
 * - El dominio valida la forma de una habilidad pero nunca la inventa. Las
 *   entradas llegan mediante una migración de autoría (AGENTS.md sección 23).
 * - Sin NestJS, sin Prisma, sin HTTP (AGENTS.md sección 8).
 */
export class Skill {
  readonly id: EntityId;

  private readonly skillName: ShortText;
  private readonly skillCategory: ShortText | null;

  private constructor(params: {
    id: EntityId;
    name: ShortText;
    category: ShortText | null;
  }) {
    this.id = params.id;
    this.skillName = params.name;
    this.skillCategory = params.category;
  }

  /**
   * EN: Builds a validated skill. Also used by the persistence mapper to
   * rehydrate a row.
   * @param props Raw primitives, see {@link SkillProps}.
   * @returns A valid `Skill`.
   * @throws {DomainError} If a primitive violates its value-object rule.
   *
   * ES: Construye una habilidad validada. También la usa el mapeador de
   * persistencia para rehidratar una fila.
   * @param props Primitivas crudas, ver {@link SkillProps}.
   * @returns Una `Skill` válida.
   * @throws {DomainError} Si una primitiva viola la regla de su value object.
   */
  static create(props: SkillProps): Skill {
    const rawCategory = props.category ?? null;
    const category =
      rawCategory === null || rawCategory.trim() === ''
        ? null
        : ShortText.of(rawCategory, {
            field: 'Skill category',
            maxLength: CATEGORY_MAX_LENGTH,
          });

    return new Skill({
      id: EntityId.of(props.id),
      name: ShortText.of(props.name, {
        field: 'Skill name',
        maxLength: NAME_MAX_LENGTH,
      }),
      category,
    });
  }

  /** EN: Skill name. / ES: Nombre de la habilidad. */
  get name(): ShortText {
    return this.skillName;
  }

  /** EN: Category label, or `null`. / ES: Etiqueta de categoría, o `null`. */
  get category(): ShortText | null {
    return this.skillCategory;
  }

  /** EN: Identity-based equality. / ES: Igualdad basada en la identidad. */
  equals(other: Skill): boolean {
    return this.id.equals(other.id);
  }
}
