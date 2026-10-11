# Backend architecture overview / Visión general de la arquitectura

## 1. What and why / Qué y por qué

EN: The backend is a **modular monolith** built with NestJS, TypeScript, Prisma
and PostgreSQL. It is organised with **Domain-Driven Design** boundaries so the
business rules stay isolated from frameworks, the database and HTTP. The goal is
not to add patterns for their own sake, but to make each layer independently
understandable and testable.

ES: El backend es un **monolito modular** construido con NestJS, TypeScript,
Prisma y PostgreSQL. Está organizado con límites de **Domain-Driven Design** para
que las reglas de negocio queden aisladas de los frameworks, la base de datos y
HTTP. El objetivo no es añadir patrones porque sí, sino hacer que cada capa sea
comprensible y testeable de forma independiente.

## 2. Layers / Capas

```
apps/api/src
├── domain/          # business rules, no framework
├── application/     # use cases orchestration
├── infrastructure/  # Prisma, repositories, config, id generation, health
├── presentation/    # controllers, pipes, DTOs, filters
├── bootstrap/       # HTTP app configuration
└── app.module.ts    # composition root
```

EN: The dependency direction is always **inward**:

```
Presentation ─▶ Application ─▶ Domain
      │               │
      └───────────────┴──▶ Infrastructure (implements ports)
```

- **Domain** depends on nothing (no Nest, no Prisma, no HTTP).
- **Application** depends only on domain ports (interfaces).
- **Infrastructure** depends on domain/application contracts and implements them.
- **Presentation** depends on application use cases and domain value objects.
- **`app.module.ts`** (composition root) is the only place allowed to know every
  layer at once; it binds each port to its Prisma implementation.

ES: La dirección de dependencias es siempre **hacia dentro**:

- **Domain** no depende de nada (sin Nest, sin Prisma, sin HTTP).
- **Application** depende solo de puertos de dominio (interfaces).
- **Infrastructure** depende de los contratos de dominio/aplicación y los implementa.
- **Presentation** depende de los casos de uso y de los value objects de dominio.
- **`app.module.ts`** (raíz de composición) es el único lugar al que se le permite
  conocer todas las capas a la vez; enlaza cada puerto con su implementación Prisma.

## 3. Bounded contexts / Contextos delimitados

| Context | Domain aggregate | Read / Write |
| --- | --- | --- |
| Project | `Project` | read-only over HTTP |
| Experience | `Experience` | read-only over HTTP |
| Skill | `Skill` | read-only over HTTP |
| Contact | `ContactMessage` | write-only over HTTP |

EN: Each context has its own folder per layer:

```
domain/<context>/{entities,value-objects,repositories,errors}
application/<context>/{use-cases,*.token.ts,errors}
infrastructure/repositories/prisma-<context>.repository.ts
presentation/<context>/{*controller.ts,dto,pipes}
```

ES: Cada contexto tiene sus propias carpetas por capa (misma estructura).

## 4. Dependency injection / Inyección de dependencias

EN: Domain repository interfaces are framework-free. Each consumer defines a
**Symbol token** (`PROJECT_REPOSITORY`, `EXPERIENCE_REPOSITORY`,
`SKILL_REPOSITORY`, `CONTACT_MESSAGE_REPOSITORY`, `HEALTH_PROBE`,
`ID_GENERATOR`). The composition root provides:

- a `useClass` binding for each port → its Prisma adapter;
- a `useFactory` binding for each use case, injecting the port.

This keeps use-case constructors plain (`new GetProjects(repository)`) and lets
tests replace any port with a double via `overrideProvider(token)`.

ES: Las interfaces de repositorio del dominio son libres de framework. Cada
consumidor define un **token `Symbol`**. La raíz de composición provee:

- un enlace `useClass` por puerto → su adaptador Prisma;
- un enlace `useFactory` por caso de uso, inyectando el puerto.

Esto mantiene los constructores de los casos de uso simples
(`new GetProjects(repository)`) y permite a las pruebas reemplazar cualquier
puerto con un doble mediante `overrideProvider(token)`.

## 5. Shared contracts / Contratos compartidos

EN: `packages/types` (`@cantantes/types`) holds only the HTTP request/response
shapes genuinely shared with `apps/web`. Domain entities never leave `apps/api`.

ES: `packages/types` (`@cantantes/types`) contiene solo las formas HTTP de
petición/respuesta realmente compartidas con `apps/web`. Las entidades de dominio
nunca salen de `apps/api`.

## 6. Health and resilience / Salud y resiliencia

EN: `GET /api/health` probes the database with a real `SELECT 1`
(`PrismaHealthProbe`). The Prisma client treats a failed boot connection as
non-fatal so the endpoint can report `degraded` instead of crashing.

ES: `GET /api/health` sondea la base de datos con un `SELECT 1` real
(`PrismaHealthProbe`). El cliente Prisma trata un fallo de conexión en el arranque
como no fatal para que el endpoint reporte `degraded` en lugar de colapsar.
