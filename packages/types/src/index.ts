/**
 * EN: Public entry point for `@cantantes/types`.
 *
 * This package holds TypeScript contracts that are genuinely consumed by both
 * `apps/web` and `apps/api` (for example HTTP request/response shapes).
 *
 * Per `AGENTS.md` section 16, nothing belongs here unless it is truly shared.
 * Domain entities and application logic must stay inside `apps/api`.
 *
 * ES: Punto de entrada público de `@cantantes/types`.
 *
 * Este paquete contiene los contratos TypeScript que realmente consumen tanto
 * `apps/web` como `apps/api` (por ejemplo, las formas de petición y respuesta
 * HTTP).
 *
 * Según `AGENTS.md` sección 16, nada pertenece aquí a menos que sea realmente
 * compartido. Las entidades de dominio y la lógica de aplicación deben
 * permanecer dentro de `apps/api`.
 */

/**
 * EN: Atmospheric gradient and accent of a project state (Stitch PRD 3.4).
 *
 * ES: Gradiente atmosférico y color de acento de un estado de proyecto
 * (Stitch PRD 3.4).
 */
export interface ProjectThemeResponse {
  /** EN: First gradient stop, `#rrggbb` lowercase. / ES: Primer color del degradado, `#rrggbb` en minúsculas. */
  readonly from: string;
  /** EN: Second gradient stop, `#rrggbb` lowercase. / ES: Segundo color del degradado, `#rrggbb` en minúsculas. */
  readonly to: string;
  /** EN: Cube and badge accent color, `#rrggbb` lowercase. / ES: Color de acento del cubo y del badge, `#rrggbb` en minúsculas. */
  readonly accent: string;
}

/**
 * EN: A project as exposed by the read-only API.
 *
 * Shape decisions:
 * - `slug` is the public identifier; internal ids and timestamps are not part
 *   of the contract.
 * - Only fields the frontend actually consumes are exposed: the typographic
 *   index text (Stitch PRD 3.2) and the per-state gradient (3.4).
 *
 * ES: Un proyecto tal como lo expone la API de solo lectura.
 *
 * Decisiones de forma:
 * - `slug` es el identificador público; los ids internos y las marcas de tiempo
 *   no forman parte del contrato.
 * - Solo se exponen los campos que el frontend realmente consume: el texto del
 *   índice tipográfico (Stitch PRD 3.2) y el degradado por estado (3.4).
 */
export interface ProjectResponse {
  readonly slug: string;
  readonly title: string;
  readonly theme: ProjectThemeResponse;
}

/** EN: Body of `GET /api/v1/projects`. / ES: Cuerpo de `GET /api/v1/projects`. */
export type ProjectListResponse = readonly ProjectResponse[];

/**
 * EN: One professional experience record (`GET /api/v1/experience`).
 *
 * Dates are ISO-8601 strings so the contract is JSON-safe. `endDate` is `null`
 * while the role is ongoing. `summary` is `null` when no description was
 * authored.
 *
 * ES: Un registro de experiencia profesional (`GET /api/v1/experience`).
 *
 * Las fechas son cadenas ISO-8601 para que el contrato sea seguro en JSON.
 * `endDate` es `null` mientras el cargo está vigente. `summary` es `null` si no
 * se escribió descripción.
 */
export interface ExperienceResponse {
  readonly company: string;
  readonly role: string;
  readonly summary: string | null;
  /** EN: ISO-8601 start date. / ES: Fecha de inicio en ISO-8601. */
  readonly startDate: string;
  /** EN: ISO-8601 end date, or `null` when ongoing. / ES: Fecha de fin en ISO-8601, o `null` si está vigente. */
  readonly endDate: string | null;
}

/** EN: Body of `GET /api/v1/experience`. / ES: Cuerpo de `GET /api/v1/experience`. */
export type ExperienceListResponse = readonly ExperienceResponse[];

/**
 * EN: One skill entry (`GET /api/v1/skills`). `category` is `null` when the
 * skill was not grouped.
 *
 * ES: Una entrada de habilidad (`GET /api/v1/skills`). `category` es `null`
 * cuando la habilidad no se agrupó.
 */
export interface SkillResponse {
  readonly name: string;
  readonly category: string | null;
}

/** EN: Body of `GET /api/v1/skills`. / ES: Cuerpo de `GET /api/v1/skills`. */
export type SkillListResponse = readonly SkillResponse[];

/**
 * EN: Body returned by `POST /api/v1/contact` after a message was stored.
 * It deliberately does not claim that an email was sent.
 *
 * ES: Cuerpo que devuelve `POST /api/v1/contact` tras almacenar un mensaje.
 * Deliberadamente no afirma que se haya enviado un correo.
 */
export interface ContactReceivedResponse {
  readonly status: 'received';
}

/**
 * EN: Body of `GET /api/health`. `status` is `ok` only when every probe passed;
 * otherwise it is `degraded` and the failing dependency is reported.
 *
 * ES: Cuerpo de `GET /api/health`. `status` es `ok` solo cuando todas las sondas
 * pasaron; en caso contrario es `degraded` y se reporta la dependencia que falla.
 */
export interface HealthResponse {
  readonly status: 'ok' | 'degraded';
  readonly database: 'up' | 'down';
}

/** EN: Error envelope shared by every endpoint. / ES: Envoltorio de error compartido por todos los endpoints. */
export interface ApiErrorResponse {
  readonly statusCode: number;
  /** EN: Stable, machine-readable summary of the failure. / ES: Resumen estable y legible por máquina del fallo. */
  readonly error: string;
  readonly message: string;
}
