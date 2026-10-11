/**
 * EN: Base error for rule violations inside the domain layer.
 *
 * It carries no framework semantics on purpose: the domain must not know about
 * HTTP status codes or exception filters (AGENTS.md section 8). The presentation
 * layer is responsible for translating this into a transport-level response.
 *
 * It lives under `domain/shared` because more than one domain now needs the same
 * rule-violation type (Project, Experience, Skill and Contact). Sharing it here
 * avoids every domain importing the Project one and keeps the dependency graph
 * clean (AGENTS.md section 16).
 *
 * ES: Error base para violaciones de reglas dentro de la capa de dominio.
 *
 * A propósito no arrastra semántica de frameworks: el dominio no debe conocer
 * códigos de estado HTTP ni filtros de excepciones (AGENTS.md sección 8). La capa
 * de presentación es responsable de traducirlo a una respuesta de transporte.
 *
 * Vive en `domain/shared` porque ahora más de un dominio necesita el mismo tipo
 * de violación de regla (Project, Experience, Skill y Contact). Compartirlo aquí
 * evita que cada dominio importe el de Project y mantiene limpio el grafo de
 * dependencias (AGENTS.md sección 16).
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
