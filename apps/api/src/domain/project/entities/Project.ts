import { DomainError } from '../errors/DomainError.js';
import { ProjectId } from '../value-objects/ProjectId.js';
import { ProjectSlug } from '../value-objects/ProjectSlug.js';
import { ProjectTitle } from '../value-objects/ProjectTitle.js';
import {
  ProjectTheme,
  type ProjectThemeProps,
} from '../value-objects/ProjectTheme.js';

/**
 * Raw shape accepted by the aggregate entry points. Raw primitives (not value
 * objects) on purpose: a persistence mapper should be able to hydrate an entity
 * straight from a database row while the entity itself still validates every
 * invariant.
 */
export type ProjectProps = {
  readonly id: string;
  readonly title: string;
  readonly theme: ProjectThemeProps;
  /** Optional: derived from the title when omitted. */
  readonly slug?: string;
};

/**
 * Stored shape. The slug is mandatory here: a persisted project always has its
 * route identity, so rehydration never silently re-derives one.
 */
export type RestoredProjectProps = Omit<ProjectProps, 'slug'> & {
  readonly slug: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type RenameProjectOptions = {
  /** Re-derive the slug from the new title. Off by default so routes stay stable. */
  readonly reslug?: boolean;
};

/**
 * A portfolio project: the unit published by the typographic index of the
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
   * @param now injectable for deterministic tests only. No clock abstraction is
   * introduced until a second consumer needs one (AGENTS.md section 18).
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

  /** Rehydrates a persisted project. Identical invariants apply to stored data. */
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
   * Renames the project. The slug is preserved by default because it is the
   * route identity of the project (Stitch PRD section 6, Phase 6); callers must
   * opt into re-deriving it.
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

  private touch(): void {
    this.currentUpdatedAt = new Date();
  }
}
