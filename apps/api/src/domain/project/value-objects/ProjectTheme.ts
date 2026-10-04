import { DomainError } from '../errors/DomainError.js';

/** Raw shape accepted from callers and from the persistence mapper. */
export type ProjectThemeProps = {
  readonly from: string;
  readonly to: string;
  readonly accent: string;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/;

function normalizeHexColor(
  raw: string,
  field: keyof ProjectThemeProps,
): string {
  if (typeof raw !== 'string') {
    throw new DomainError(`ProjectTheme ${field} must be a string`);
  }

  const candidate = raw.trim().toLowerCase();
  const normalized = candidate.startsWith('#') ? candidate : `#${candidate}`;

  if (!HEX_COLOR.test(normalized)) {
    throw new DomainError(
      `ProjectTheme ${field} must be a 6-digit hex color (for example #73a9ad)`,
    );
  }

  return normalized;
}

/**
 * Visual state of a Project: the atmospheric background gradient and the accent
 * color used by the interactive cube and the pulsing badge dot.
 *
 * Justified by the Stitch PRD section 3.4, which defines one gradient pair per
 * project state (for example `#73A9AD -> #eef5f5`, `#09203f -> #00d2ff`) and
 * section 3.3, where the inner octahedron reacts to the active theme accent.
 * The frontend feeds these values to GSAP background transitions and to canvas
 * textures, so a malformed color has to be rejected before it reaches the
 * renderer. Colors are normalized to lowercase `#rrggbb` to keep a single
 * representation per state.
 *
 * Invariant: the two gradient stops must differ. The PRD always describes a real
 * transition between two stops; identical stops would make the cross-fade a
 * no-op that the user reads as a broken background.
 */
export class ProjectTheme {
  readonly from: string;
  readonly to: string;
  readonly accent: string;

  private constructor(from: string, to: string, accent: string) {
    this.from = from;
    this.to = to;
    this.accent = accent;
  }

  static of(props: ProjectThemeProps): ProjectTheme {
    const from = normalizeHexColor(props.from, 'from');
    const to = normalizeHexColor(props.to, 'to');

    if (from === to) {
      throw new DomainError(
        'ProjectTheme gradient stops must be different colors',
      );
    }

    return new ProjectTheme(
      from,
      to,
      normalizeHexColor(props.accent, 'accent'),
    );
  }

  equals(other: ProjectTheme): boolean {
    return (
      this.from === other.from &&
      this.to === other.to &&
      this.accent === other.accent
    );
  }
}
