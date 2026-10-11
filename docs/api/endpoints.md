# API endpoints / Endpoints de la API

## Base URL / URL base

```
http://localhost:3001/api
```

EN: The global prefix is `api` and URI versioning defaults to `v1`, so feature
routes live under `/api/v1`. `GET /api/health` is **version-neutral** and has no
`/v1` segment.

ES: El prefijo global es `api` y el versionado por URI es `v1` por defecto, así
que las rutas de características viven bajo `/api/v1`. `GET /api/health` es
**neutro en versión** y no tiene segmento `/v1`.

## Summary / Resumen

| Method | Path | Description / Descripción |
| --- | --- | --- |
| GET | `/api/v1/projects` | EN: List projects. / ES: Lista proyectos. |
| GET | `/api/v1/projects/:slug` | EN: One project by slug. / ES: Un proyecto por slug. |
| GET | `/api/v1/experience` | EN: List experience entries. / ES: Lista experiencias. |
| GET | `/api/v1/skills` | EN: List skills. / ES: Lista habilidades. |
| POST | `/api/v1/contact` | EN: Store a contact message. / ES: Guarda un mensaje de contacto. |
| GET | `/api/health` | EN: Liveness + database probe. / ES: Liveness + sondeo de base de datos. |

---

## GET /api/v1/projects

EN: Returns every project, oldest first. An empty table answers `[]`. Public
identifiers and timestamps are not part of the contract; only what the frontend
consumes is exposed.

ES: Devuelve todos los proyectos, del más antiguo al más nuevo. Una tabla vacía
responde `[]`. Los identificadores públicos internos y las marcas de tiempo no
forman parte del contrato; solo se expone lo que consume el frontend.

**200** — `ProjectListResponse` (`ProjectResponse[]`)

```json
[
  {
    "slug": "sade",
    "title": "Sade",
    "theme": { "from": "#73a9ad", "to": "#eef5f5", "accent": "#09203f" }
  }
]
```

---

## GET /api/v1/projects/:slug

EN: Returns one project. Unknown slug → `404`.

ES: Devuelve un proyecto. Slug desconocido → `404`.

**200** — `ProjectResponse` (same shape as one list item)

**400** — invalid slug (not canonical)

```json
{ "statusCode": 400, "error": "Bad Request", "message": "Invalid project slug" }
```

**404** — project not found

```json
{ "statusCode": 404, "error": "Not Found", "message": "Project not found" }
```

---

## GET /api/v1/experience

EN: Returns every experience entry, most recent first. Empty table → `[]`.
`summary` and `endDate` are `null` when respectively absent and ongoing.

ES: Devuelve todas las experiencias, la más reciente primero. Tabla vacía → `[]`.
`summary` y `endDate` son `null` cuando respectivamente no existe y sigue vigente.

**200** — `ExperienceListResponse` (`ExperienceResponse[]`)

```json
[
  {
    "company": "...",
    "role": "...",
    "summary": null,
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": null
  }
]
```

---

## GET /api/v1/skills

EN: Returns every skill. Empty table → `[]`. `category` is `null` when the skill
was not grouped.

ES: Devuelve todas las habilidades. Tabla vacía → `[]`. `category` es `null`
cuando la habilidad no se agrupó.

**200** — `SkillListResponse` (`SkillResponse[]`)

```json
[{ "name": "TypeScript", "category": "backend" }]
```

---

## POST /api/v1/contact

EN: Validates and stores a contact message. **No email is sent.** The message is
persisted only. The response never echoes the submitted content, and no message
body, email or other PII is logged.

ES: Valida y guarda un mensaje de contacto. **No se envía correo.** El mensaje
solo se persiste. La respuesta nunca repite el contenido enviado, y no se registra
el cuerpo del mensaje, el correo ni otros datos personales.

**Request body**

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "message": "This is a long enough message."
}
```

**201** — `ContactReceivedResponse`

```json
{ "status": "received" }
```

**400** — validation failed (fixed messages, the rejected value is not echoed).
Possible messages: `Request body must be a JSON object`, `Invalid name`,
`Invalid email address`, `Invalid message`.

```json
{ "statusCode": 400, "error": "Bad Request", "message": "Invalid email address" }
```

---

## GET /api/health

EN: Liveness probe plus a real database check (`SELECT 1`). Version-neutral.

ES: Sonda de liveness más una comprobación real de base de datos (`SELECT 1`).
Neutro en versión.

**200** — `{ "status": "ok", "database": "up" }`

**503** — `{ "status": "degraded", "database": "down" }`

EN: Both bodies use the `HealthResponse` shape, not the error envelope.

ES: Ambos cuerpos usan la forma `HealthResponse`, no el envoltorio de error.

---

## Error shape / Forma de error

EN: Every error answers the shared `ApiErrorResponse`. `message` is always a
string: the filter joins an array of validation messages into one.

ES: Cada error responde el `ApiErrorResponse` compartido. `message` siempre es una
cadena: el filtro une un arreglo de mensajes de validación en uno solo.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid request"
}
```

EN: `ProjectNotFoundError` → `404` (`Project not found`), `DomainError` → `400`
(`Invalid request`), any other `4xx` keeps its own fixed message. Anything `5xx`
or unrecognised answers the constant `Internal server error`; the stacktrace, the
SQL and the connection string are logged server-side only and never reach the
client.

ES: `ProjectNotFoundError` → `404` (`Project not found`), `DomainError` → `400`
(`Invalid request`), cualquier otro `4xx` conserva su mensaje fijo. Cualquier cosa
`5xx` o no reconocida responde el constante `Internal server error`; el stacktrace,
el SQL y la cadena de conexión se registran solo en el servidor y nunca llegan al
cliente.
