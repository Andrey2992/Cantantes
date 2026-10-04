/**
 * Public entry point for `@cantantes/types`.
 *
 * This package holds TypeScript contracts that are genuinely consumed by both
 * `apps/web` and `apps/api` (for example HTTP request/response shapes).
 *
 * Per `AGENTS.md` section 16, nothing belongs here unless it is truly shared.
 * Domain entities and application logic must stay inside `apps/api`.
 */

/** Atmospheric gradient and accent of a project state (Stitch PRD 3.4). */
export interface ProjectThemeResponse {
  /** First gradient stop, `#rrggbb` lowercase. */
  readonly from: string;
  /** Second gradient stop, `#rrggbb` lowercase. */
  readonly to: string;
  /** Cube and badge accent color, `#rrggbb` lowercase. */
  readonly accent: string;
}

/**
 * A project as exposed by the read-only API.
 *
 * Shape decisions:
 * - `slug` is the public identifier; internal ids and timestamps are not part
 *   of the contract.
 * - Only fields the frontend actually consumes are exposed: the typographic
 *   index text (Stitch PRD 3.2) and the per-state gradient (3.4).
 */
export interface ProjectResponse {
  readonly slug: string;
  readonly title: string;
  readonly theme: ProjectThemeResponse;
}

/** Body of `GET /projects`. */
export type ProjectListResponse = readonly ProjectResponse[];

/** Error envelope shared by every endpoint. */
export interface ApiErrorResponse {
  readonly statusCode: number;
  /** Stable, machine-readable summary of the failure. */
  readonly error: string;
  readonly message: string;
}