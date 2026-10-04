/**
 * Raised by the use cases when a project does not exist.
 *
 * It is an application-level error, not an HTTP concern: the presentation layer
 * decides that this becomes `404`. Keeping it out of the domain avoids
 * modelling "not found" as a domain invariant (AGENTS.md sections 8 and 9).
 */
export class ProjectNotFoundError extends Error {
  constructor(readonly slug: string) {
    super(`Project "${slug}" was not found`);
    this.name = 'ProjectNotFoundError';
  }
}
