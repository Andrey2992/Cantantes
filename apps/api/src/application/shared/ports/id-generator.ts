/**
 * EN: Application-level port for identity generation.
 *
 * A use case that creates an aggregate (Contact) needs a new identity, but the
 * application layer must not depend on a concrete random source: importing
 * `node:crypto` there would couple the use case to a runtime facility and make it
 * non-deterministic in tests. This tiny port inverts that dependency — the use
 * case asks for the next id, infrastructure (or a test double) decides how it is
 * produced. The domain still treats the id as an opaque value (see `EntityId`).
 *
 * ES: Puerto de nivel de aplicación para la generación de identidades.
 *
 * Un caso de uso que crea un agregado (Contact) necesita una identidad nueva, pero
 * la capa de aplicación no debe depender de una fuente aleatoria concreta:
 * importar `node:crypto` ahí acoplaría el caso de uso a una utilidad del runtime y
 * lo haría no determinista en pruebas. Este pequeño puerto invierte esa
 * dependencia: el caso de uso pide el siguiente id y la infraestructura (o un
 * doble de prueba) decide cómo se produce. El dominio sigue tratando el id como un
 * valor opaco (ver `EntityId`).
 */
export interface IdGenerator {
  /** EN: Produces the next unique identifier. / ES: Produce el siguiente identificador único. */
  next(): string;
}

/**
 * EN: Injection token for {@link IdGenerator}. Provided in the composition root
 * and replaced by a deterministic double in tests.
 *
 * ES: Token de inyección para {@link IdGenerator}. Se provee en la raíz de
 * composición y se reemplaza por un doble determinista en las pruebas.
 */
export const ID_GENERATOR = Symbol('ID_GENERATOR');
