import { DomainError } from '../../shared/errors/DomainError.js';
import { ProjectId } from '../value-objects/ProjectId.js';
import { ProjectSlug } from '../value-objects/ProjectSlug.js';
import { ProjectTitle } from '../value-objects/ProjectTitle.js';
import {
  ProjectTheme,
  type ProjectThemeProps,
} from '../value-objects/ProjectTheme.js';

/**
 * EN: Raw shape accepted by the aggregate entry points. Raw primitives (not value
 * objects) on purpose: a persistence mapper should be able to hydrate an entity
 * straight from a database row while the entity itself still validates every
 * invariant.
 *
 * ES: Forma cruda aceptada por los puntos de entrada del agregado. Primitivas (no
 * value objects) a propósito: un mapeador de persistencia debe poder hidratar una
 * entidad directamente desde una fila de base de datos mientras la entidad sigue
 * validando cada invariante.
 */
export type ProjectProps = {
  readonly id: string;
  readonly title: string;
  readonly theme: ProjectThemeProps;
  /** EN: Optional: derived from the title when omitted. / ES: Opcional: se deriva del título cuando se omite. */
  readonly slug?: string;
};

/**
 * EN: Stored shape. The slug is mandatory here: a persisted project always has its
 * route identity, so rehydration never silently re-derives one.
 *
 * ES: Forma almacenada. El slug es obligatorio aquí: un proyecto persistido
 * siempre tiene su identidad de ruta, así que la rehidratación nunca deriva una en
 * silencio.
 */
export type RestoredProjectProps = Omit<ProjectProps, 'slug'> & {
  readonly slug: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 * EN: Options of {@link Project.rename}.
 *
 * ES: Opciones de {@link Project.rename}.
 */
export type RenameProjectOptions = {
  /** EN: Re-derive the slug from the new title. Off by default so routes stay stable. / ES: Re-deriva el slug desde el nuevo título. Desactivado por defecto para que las rutas sigan estables. */
  readonly reslug?: boolean;
};

/**
 * EN: A portfolio project: the unit published by the typographic index of the
 * frontend (Stitch PRD section 3.2) and reflected by the interactive cube state
 * (sections 3.3 and 3.4).
 *
 * Design notes:
 * - The constructor is private. Instances exist only through `create` (new
 *   project) and `restore` (hydrated from storage), so no caller can build a
 *   Project that skipped validation.
 * - State changes only through behaviour that encodes a rule: `rename` and
 *   `changeTheme`. There is no generic setter and no public mutable collection.
 * - The entity depends on nothing but its own value objects. No NestJS, no
 *   Prisma, no HTTP (AGENTS.md section 8).
 * - Identity is `id`; `slug` is a separate, renameable URL concern.
 *
 * ES: Un proyecto del portafolio: la unidad que publica el índice tipográfico del
 * frontend (Stitch PRD sección 3.2) y que refleja el estado del cubo interactivo
 * (secciones 3.3 y 3.4).
 *
 * Notas de diseño:
 * - El constructor es privado. Las instancias solo existen a través de `create`
 *   (proyecto nuevo) y `restore` (hidratado desde el almacenamiento), así que
 *   ningún llamador puede construir un Project que omitió la validación.
 * - El estado cambia solo mediante comportamiento que codifica una regla: `rename`
 *   y `changeTheme`. No hay setter genérico ni colección mutable pública.
 * - La entidad no depende de nada más que sus propios value objects. Sin NestJS,
 *   sin Prisma, sin HTTP (AGENTS.md sección 8).
 * - La identidad es `id`; `slug` es una preocupación de URL separada y renombrable.
 */
export class Project {
  readonly id: ProjectId;
  readonly createdAt: Date;

  private currentTitle: ProjectTitle;
  private currentSlug: ProjectSlug;
  private currentTheme: ProjectTheme;
  private currentUpdatedAt: Date;

  private constructor(params: {
    id: ProjectId;
    title: ProjectTitle;
    slug: ProjectSlug;
    theme: ProjectTheme;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.currentTitle = params.title;
    this.currentSlug = params.slug;
    this.currentTheme = params.theme;
    this.createdAt = params.createdAt;
    this.currentUpdatedAt = params.updatedAt;
  }

  /**
   * EN: Creates a brand-new project, deriving the slug from the title when none
   * is supplied.
   * @param props Raw primitives, see {@link ProjectProps}.
   * @param now Injectable clock for deterministic tests only. No clock abstraction
   * is introduced until a second consumer needs one (AGENTS.md section 18).
   * @returns A valid `Project` whose timestamps share the same instant.
   * @throws {DomainError} If any primitive violates its value-object rule.
   *
   * ES: Crea un proyecto completamente nuevo, derivando el slug del título cuando
   * no se aporta ninguno.
   * @param props Primitivas crudas, ver {@link ProjectProps}.
   * @param now Reloj inyectable solo para pruebas deterministas. No se introduce
   * una abstracción de reloj hasta que un segundo consumidor la necesite
   * (AGENTS.md sección 18).
   * @returns Un `Project` válido cuyas marcas de tiempo comparten el mismo instante.
   * @throws {DomainError} Si alguna primitiva viola la regla de su value object.
   */
  static create(props: ProjectProps, now: Date = new Date()): Project {
    const title = ProjectTitle.of(props.title);

    return new Project({
      id: ProjectId.of(props.id),
      title,
      slug:
        props.slug === undefined
          ? ProjectSlug.fromTitle(title)
          : ProjectSlug.of(props.slug),
      theme: ProjectTheme.of(props.theme),
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * EN: Rehydrates a persisted project. Identical invariants apply to stored data.
   * @param props Stored primitives, see {@link RestoredProjectProps}.
   * @returns A valid `Project`.
   * @throws {DomainError} If a primitive is invalid or the stored `updatedAt`
   * predates `createdAt`.
   *
   * ES: Rehidrata un proyecto persistido. Se aplican las mismas invariantes a los
   * datos almacenados.
   * @param props Primitivas almacenadas, ver {@link RestoredProjectProps}.
   * @returns Un `Project` válido.
   * @throws {DomainError} Si una primitiva es inválida o si el `updatedAt`
   * almacenado es anterior a `createdAt`.
   */
  static restore(props: RestoredProjectProps): Project {
    if (props.updatedAt.getTime() < props.createdAt.getTime()) {
      throw new DomainError(
        'Project updatedAt must not be earlier than createdAt',
      );
    }

    return new Project({
      id: ProjectId.of(props.id),
      title: ProjectTitle.of(props.title),
      slug: ProjectSlug.of(props.slug),
      theme: ProjectTheme.of(props.theme),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get title(): ProjectTitle {
    return this.currentTitle;
  }

  get slug(): ProjectSlug {
    return this.currentSlug;
  }

  get theme(): ProjectTheme {
    return this.currentTheme;
  }

  get updatedAt(): Date {
    return this.currentUpdatedAt;
  }

  /**
   * EN: Renames the project. The slug is preserved by default because it is the
   * route identity of the project (Stitch PRD section 6, Phase 6); callers must
   * opt into re-deriving it.
   * @param title New title, already validated.
   * @param options See {@link RenameProjectOptions}.
   * @returns Nothing. Mutates the aggregate and refreshes `updatedAt` only when the
   * title actually changed.
   *
   * ES: Renombra el proyecto. El slug se conserva por defecto porque es la
   * identidad de ruta del proyecto (Stitch PRD sección 6, Fase 6); los llamadores
   * deben optar explícitamente por re-derivarlo.
   * @param title Nuevo título, ya validado.
   * @param options Ver {@link RenameProjectOptions}.
   * @returns Nada. Muta el agregado y refresca `updatedAt` solo cuando el título
   * realmente cambió.
   */
  rename(title: ProjectTitle, options: RenameProjectOptions = {}): void {
    if (title.equals(this.currentTitle)) {
      return;
    }

    this.currentTitle = title;

    if (options.reslug === true) {
      this.currentSlug = ProjectSlug.fromTitle(title);
    }

    this.touch();
  }

  /**
   * EN: Replaces the visual state (gradient + accent) and refreshes `updatedAt`
   * only when it actually changed.
   * @param theme New theme, already validated.
   *
   * ES: Reemplaza el estado visual (degradado + acento) y refresca `updatedAt`
   * solo cuando realmente cambió.
   * @param theme Nuevo tema, ya validado.
   */
  changeTheme(theme: ProjectTheme): void {
    if (theme.equals(this.currentTheme)) {
      return;
    }

    this.currentTheme = theme;
    this.touch();
  }

  equals(other: Project): boolean {
    return this.id.equals(other.id);
  }

  /**
   * EN: Refreshes `updatedAt`. Private because it is an implementation detail of
   * the mutating operations, not a domain behaviour on its own.
   *
   * ES: Refresca `updatedAt`. Privado porque es un detalle de implementación de las
   * operaciones que mutan, no un comportamiento de dominio por sí mismo.
   */
  private touch(): void {
    this.currentUpdatedAt = new Date();
  }
}
