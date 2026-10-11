# Backend documentation / Documentación del backend

> EN: Learning-oriented documentation for the NestJS + Prisma + PostgreSQL
> backend of the portfolio. Every document is bilingual (English first, Spanish
> second).
>
> ES: Documentación orientada al aprendizaje del backend NestJS + Prisma +
> PostgreSQL del portafolio. Cada documento es bilingüe (primero inglés, luego
> español).

## Index / Índice

| Document | Contents |
| --- | --- |
| [architecture/backend-overview.md](./architecture/backend-overview.md) | EN: Layers, DDD boundaries, composition root. / ES: Capas, límites DDD, raíz de composición. |
| [architecture/request-lifecycle.md](./architecture/request-lifecycle.md) | EN: How a request travels through the layers. / ES: Cómo viaja una petición por las capas. |
| [api/endpoints.md](./api/endpoints.md) | EN: HTTP contract, validation, errors, examples. / ES: Contrato HTTP, validación, errores, ejemplos. |
| [modules/projects.md](./modules/projects.md) | EN: Project module end to end. / ES: Módulo Project de punta a punta. |
| [modules/experience.md](./modules/experience.md) | EN: Experience module. / ES: Módulo Experience. |
| [modules/skills.md](./modules/skills.md) | EN: Skill module. / ES: Módulo Skill. |
| [modules/contact.md](./modules/contact.md) | EN: Contact module. / ES: Módulo Contact. |
| [database/persistence.md](./database/persistence.md) | EN: Prisma schema, migrations, mapping. / ES: Esquema Prisma, migraciones, mapeo. |

## How to read this / Cómo leer esto

EN: Each document answers: what the component does, why it exists, which layer it
belongs to, its dependencies, the request flow, and how Prisma stays out of the
domain. Concrete examples use the real routes of this API.

ES: Cada documento responde: qué hace el componente, por qué existe, a qué capa
pertenece, sus dependencias, el flujo de la petición y cómo Prisma se mantiene
fuera del dominio. Los ejemplos concretos usan las rutas reales de esta API.

## Conventions / Convenciones

- EN: `Domain` → business rules and types. `Application` → use cases. `Infrastructure` → Prisma, repos, external services. `Presentation` → NestJS controllers, pipes, DTOs, filters.
- ES: `Domain` → reglas y tipos de negocio. `Application` → casos de uso. `Infrastructure` → Prisma, repositorios, servicios externos. `Presentation` → controladores NestJS, pipes, DTOs, filtros.
- EN: Shared HTTP contracts live in `packages/types` (`@cantantes/types`).
- ES: Los contratos HTTP compartidos viven en `packages/types` (`@cantantes/types`).
