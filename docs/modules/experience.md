# Module: Experience / Módulo: Experience

## Purpose / Propósito

EN: Read-only bounded context for the professional experience records of the
portfolio owner. It exposes company, role, optional summary and an ISO-8601 time
span. The API returns accurate, empty results when nothing has been authored; it
never invents entries.

ES: Contexto delimitado de solo lectura para los registros de experiencia
profesional del dueño del portafolio. Expone empresa, cargo, resumen opcional y un
intervalo ISO-8601. La API devuelve resultados precisos y vacíos cuando no se ha
redactado nada; nunca inventa entradas.

## Files / Archivos

| Layer | File |
| --- | --- |
| Domain | `domain/experience/entities/Experience.ts` |
| Domain | `domain/experience/value-objects/ExperiencePeriod.ts` |
| Domain | `domain/experience/repositories/ExperienceRepository.ts` |
| Application | `application/experience/use-cases/get-experience.ts` |
| Application | `application/experience/experience-repository.token.ts` |
| Infrastructure | `infrastructure/repositories/prisma-experience.repository.ts` |
| Presentation | `presentation/experience/experiences.controller.ts` |
| Presentation | `presentation/experience/dto/experience-response.dto.ts` |

## Domain / Dominio

EN: `Experience` is an aggregate root with a private constructor and a single
`create` factory (no `create`/`restore` split: it holds no persistence-only
state). It composes three shared value objects (`EntityId`, `ShortText`,
`LongText`) and the `ExperiencePeriod` value object.

ES: `Experience` es una raíz de agregado con constructor privado y una sola
fábrica `create` (sin división `create`/`restore`: no guarda estado exclusivo de
persistencia). Compone tres value objects compartidos (`EntityId`, `ShortText`,
`LongText`) y el value object `ExperiencePeriod`.

### ExperiencePeriod

- EN: Real invariant: an end date may not precede the start date.
- EN: Models an ongoing role explicitly as `end === null` (via `isOngoing`),
  instead of a sentinel far-future date.
- EN: Takes defensive copies of the `Date` objects on the way in and out.
- ES: Invariante real: una fecha de fin no puede ser anterior a la de inicio.
- ES: Modela un cargo vigente explícitamente como `end === null` (mediante
  `isOngoing`), en lugar de una fecha centinela en el futuro lejano.
- ES: Toma copias defensivas de los objetos `Date` a la entrada y a la salida.

### Invariants / Invariantes

| Field | Rule | EN | ES |
| --- | --- | --- | --- |
| `id` | UUID | Identity | Identidad |
| `company` | non-empty, ≤ 120 | Company name | Nombre de empresa |
| `role` | non-empty, ≤ 160 | Role title | Título del cargo |
| `summary` | optional, ≤ 2000, empty → `null` | Description | Descripción |
| `period.start` | valid `Date` | Start | Inicio |
| `period.end` | `null` or `≥ start` | End / ongoing | Fin / vigente |

## Application / Aplicación

- EN: `GetExperience.execute()` → `ExperienceRepository.findAll()`.
- ES: `GetExperience.execute()` → `ExperienceRepository.findAll()`.
- EN: No filtering, sorting or reshaping: ordering is a storage decision.
- ES: Sin filtrado, orden ni reconfiguración: el orden es decisión del almacenamiento.

## Infrastructure / Infraestructura

EN: `PrismaExperienceRepository.findAll` orders by `startDate desc` and maps each
row with the exported `toExperience`, which runs `Experience.create` to re-validate
the row.

ES: `PrismaExperienceRepository.findAll` ordena por `startDate desc` y mapea cada
fila con `toExperience` (exportado), que ejecuta `Experience.create` para
re-validar la fila.

## Presentation / Presentación

- EN: `GET /api/v1/experience` → `list()`, mapping each aggregate with
  `toExperienceResponse`.
- EN: `toExperienceResponse` serializes dates with `Date.toISOString()`.
- ES: `GET /api/v1/experience` → `list()`, mapeando cada agregado con
  `toExperienceResponse`.
- ES: `toExperienceResponse` serializa las fechas con `Date.toISOString()`.

## Tests / Pruebas

- EN: `ExperiencePeriod` and `Experience` specs; `GetExperience` use-case spec;
  `toExperience` mapper spec; `test/experience.e2e-spec.ts`.
- ES: Specs de `ExperiencePeriod` y `Experience`; spec del caso de uso
  `GetExperience`; spec del mapeador `toExperience`; `test/experience.e2e-spec.ts`.
