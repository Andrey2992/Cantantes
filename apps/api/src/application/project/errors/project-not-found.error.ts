/**
 * EN: Raised by the use cases when a project does not exist.
 *
 * It is an application-level error, not an HTTP concern: the presentation layer
 * decides that this becomes `404`. Keeping it out of the domain avoids
 * modelling "not found" as a domain invariant (AGENTS.md sections 8 and 9).
 *
 * ES: Lanzada por los casos de uso cuando un proyecto no existe.
 *
 * Es un error de nivel de aplicación, no una preocupación HTTP: la capa de
 * presentación decide que esto se convierte en `404`. Mantenerlo fuera del dominio
 * evita modelar "no encontrado" como una invariante de dominio (AGENTS.md
 * secciones 8 y 9).
 */
export class ProjectNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`Project "${slug}" was not found`);
    this.name = 'ProjectNotFoundError';
  }
}
