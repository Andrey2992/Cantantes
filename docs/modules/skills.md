# Module: Skills / Módulo: Skills

## Purpose / Propósito

EN: Read-only bounded context for the skills listed in the portfolio. It exposes
a name and an optional category. The domain deliberately does **not** model a
proficiency level: the portfolio does not publish qualification claims, and
inventing a scale would be misleading.

ES: Contexto delimitado de solo lectura para las habilidades listadas en el
portafolio. Expone un nombre y una categoría opcional. El dominio deliberadamente
**no** modela un nivel de dominio: el portafolio no publica afirmaciones de
cualificación e inventar una escala sería engañoso.

## Files / Archivos

| Layer | File |
| --- | --- |
| Domain | `domain/skill/entities/Skill.ts` |
| Domain | `domain/skill/repositories/SkillRepository.ts` |
| Application | `application/skill/use-cases/get-skills.ts` |
| Application | `application/skill/skill-repository.token.ts` |
| Infrastructure | `infrastructure/repositories/prisma-skill.repository.ts` |
| Presentation | `presentation/skill/skills.controller.ts` |
| Presentation | `presentation/skill/dto/skill-response.dto.ts` |

## Domain / Dominio

EN: `Skill` is an aggregate root with a private constructor and a single `create`
factory. It composes `EntityId` and `ShortText`.

ES: `Skill` es una raíz de agregado con constructor privado y una sola fábrica
`create`. Compone `EntityId` y `ShortText`.

### Invariants / Invariantes

| Field | Rule | EN | ES |
| --- | --- | --- | --- |
| `id` | UUID | Identity | Identidad |
| `name` | non-empty, ≤ 80 | Skill name | Nombre de la habilidad |
| `category` | optional, ≤ 60, empty → `null` | Grouping label | Etiqueta de agrupación |

## Application / Aplicación

- EN: `GetSkills.execute()` → `SkillRepository.findAll()`.
- ES: `GetSkills.execute()` → `SkillRepository.findAll()`.

## Infrastructure / Infraestructura

EN: `PrismaSkillRepository.findAll` orders by `[{ category: 'asc' }, { name:
'asc' }]` so results are stable and grouped. Mapping uses the exported `toSkill`.

ES: `PrismaSkillRepository.findAll` ordena por `[{ category: 'asc' }, { name:
'asc' }]` para que los resultados sean estables y agrupados. El mapeo usa
`toSkill` (exportado).

> EN: Note the ordering is a persistence decision. SQL treats `NULL` categories
> per the database collation; the domain does not impose an order.
>
> ES: Nota: el orden es una decisión de persistencia. SQL trata las categorías
> `NULL` según la colación de la base de datos; el dominio no impone un orden.

## Presentation / Presentación

- EN: `GET /api/v1/skills` → `list()`, mapping each aggregate with
  `toSkillResponse` (`{ name, category }`).
- ES: `GET /api/v1/skills` → `list()`, mapeando cada agregado con
  `toSkillResponse` (`{ name, category }`).

## Tests / Pruebas

- EN: `Skill` spec; `GetSkills` use-case spec; `toSkill` mapper spec;
  `test/skills.e2e-spec.ts`.
- ES: Spec de `Skill`; spec del caso de uso `GetSkills`; spec del mapeador
  `toSkill`; `test/skills.e2e-spec.ts`.
