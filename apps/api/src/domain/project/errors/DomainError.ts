/**
 * Base error for rule violations inside the domain layer.
 *
 * It carries no framework semantics on purpose: the domain must not know about
 * HTTP status codes or exception filters (AGENTS.md section 8). The presentation
 * layer is responsible for translating this into a transport-level response.
 *
 * It lives under `domain/project/errors` because the Project domain is the only
 * consumer so far. It should move to a shared domain location only when a second
 * domain actually needs it (AGENTS.md section 16).
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
