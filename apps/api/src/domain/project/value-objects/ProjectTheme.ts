import { DomainError } from '../../shared/errors/DomainError.js';

/**
 * EN: Raw shape accepted from callers and from the persistence mapper.
 *
 * ES: Forma cruda aceptada por los llamadores y por el mapeador de persistencia.
 */
export type ProjectThemeProps = {
  readonly from: string;
  readonly to: string;
  readonly accent: string;
};

const HEX_COLOR = /^#[0-9a-f]{6}$/;

/**
 * EN: Validates and normalizes one hex color field. It is a module-private helper
 * because only this value object needs it; keeping it out of the class avoids a
 * public API nobody else uses.
 *
 * ES: Valida y normaliza un campo de color hexadecimal. Es un ayudante privado del
 * módulo porque solo este value object lo necesita; mantenerlo fuera de la clase
 * evita una API pública que nadie más usa.
 */
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
 * EN: Visual state of a Project: the atmospheric background gradient and the
 * accent color used by the interactive cube and the pulsing badge dot.
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
 *
 * ES: Estado visual de un Project: el degradado atmosférico de fondo y el color de
 * acento usado por el cubo interactivo y el punto pulsante del badge.
 *
 * Justificado por el Stitch PRD sección 3.4, que define un par de degradado por
 * estado de proyecto (por ejemplo `#73A9AD -> #eef5f5`, `#09203f -> #00d2ff`) y
 * por la sección 3.3, donde el octaedro interior reacciona al acento del tema
 * activo. El frontend entrega estos valores a las transiciones de fondo de GSAP y
 * a las texturas del canvas, así que un color mal formado debe rechazarse antes de
 * llegar al renderizador. Los colores se normalizan a `#rrggbb` en minúsculas para
 * mantener una sola representación por estado.
 *
 * Invariante: los dos colores del degradado deben diferir. El PRD siempre describe
 * una transición real entre dos colores; colores idénticos convertirían el
 * fundido cruzado en una operación nula que el usuario leería como un fondo roto.
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

  /**
   * EN: Validates a theme: three hex colors, with different gradient stops.
   * @param props Raw color fields, see {@link ProjectThemeProps}.
   * @returns A normalized `ProjectTheme`.
   * @throws {DomainError} If a color is not a 6-digit hex value or the stops match.
   *
   * ES: Valida un tema: tres colores hexadecimales, con los colores del degradado
   * distintos.
   * @param props Campos de color crudos, ver {@link ProjectThemeProps}.
   * @returns Un `ProjectTheme` normalizado.
   * @throws {DomainError} Si un color no es un hexadecimal de 6 dígitos o si los
   * colores del degradado coinciden.
   */
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
