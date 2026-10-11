# Frontend ↔ API integration / Integración frontend ↔ API

> EN: How `apps/web` (Next.js) talks to `apps/api` (NestJS). Scope of this
> document: configuration, the transport layer, the resource modules, error
> handling, the contact Server Action, and how to run and verify everything.
>
> ES: Cómo `apps/web` (Next.js) habla con `apps/api` (NestJS). Alcance de este
> documento: configuración, la capa de transporte, los módulos de recurso, el
> manejo de errores, la Server Action de contacto y cómo ejecutar y verificar
> todo.

---

## 1. Overview / Resumen

EN: All data access lives in one small, typed, **server-only** layer under
`apps/web/lib/api`. Presentation never performs `fetch` calls directly and never
knows the API origin. Server Components read data through the resource modules;
the contact form submits through a Server Action that reuses the same layer.

ES: Todo el acceso a datos vive en una capa pequeña, tipada y **solo para el
servidor** bajo `apps/web/lib/api`. La presentación nunca hace `fetch` por su
cuenta ni conoce el origen de la API. Los Server Components leen datos a través
de los módulos de recurso; el formulario de contacto se envía mediante una Server
Action que reutiliza la misma capa.

```text
Next.js Server Component  ─┐
                           ├─► lib/api (typed client) ─► fetch ─► NestJS /api/...
Next.js Server Action     ─┘
```

---

## 2. Endpoints consumed / Endpoints consumidos

| Frontend function | Method | Endpoint | Shared contract |
| --- | --- | --- | --- |
| `listProjects()` | `GET` | `/api/v1/projects` | `ProjectListResponse` |
| `getProjectBySlug(slug)` | `GET` | `/api/v1/projects/:slug` | `ProjectResponse` |
| `listExperience()` | `GET` | `/api/v1/experience` | `ExperienceListResponse` |
| `listSkills()` | `GET` | `/api/v1/skills` | `SkillListResponse` |
| `submitContactMessage(input)` | `POST` | `/api/v1/contact` | `ContactReceivedResponse` |
| `getHealth()` | `GET` | `/api/health` | `HealthResponse` |

EN: Response contracts come from `@cantantes/types`, the package shared by the
frontend and the backend, so a contract change is a compile error on both sides.
`GET /api/health` is version-neutral on purpose (no `/v1`).

ES: Los contratos de respuesta provienen de `@cantantes/types`, el paquete
compartido por frontend y backend, así que un cambio de contrato es un error de
compilación en ambos lados. `GET /api/health` es neutro en versión a propósito
(sin `/v1`).

---

## 3. Configuration / Configuración

EN: A single variable holds the backend location:

ES: Una sola variable contiene la ubicación del backend:

```bash
# apps/web/.env.local  (git-ignored)
API_BASE_URL=http://localhost:3001
```

- EN: Copy `apps/web/.env.example` to `apps/web/.env.local`. Next.js reads `.env*`
  files from the application directory (`apps/web`), **not** from the repository
  root; the root `.env` is for Docker/Prisma and the API only.
- ES: Copia `apps/web/.env.example` a `apps/web/.env.local`. Next.js lee los
  archivos `.env*` desde el directorio de la aplicación (`apps/web`), **no** desde
  la raíz del repositorio; el `.env` de la raíz es solo para Docker/Prisma y la
  API.

- EN: `API_BASE_URL` is **server-only**: it has no `NEXT_PUBLIC_` prefix, so it is
  never inlined into the browser bundle. `resolveApiBaseUrl()` also throws if the
  layer is ever imported in a browser. The browser therefore never learns the API
  origin, which is fine because all access is server-side.
- ES: `API_BASE_URL` es **solo para el servidor**: no lleva el prefijo
  `NEXT_PUBLIC_`, así que nunca se incorpora al bundle del navegador.
  `resolveApiBaseUrl()` además lanza si la capa se importa alguna vez en un
  navegador. Por lo tanto el navegador nunca conoce el origen de la API, lo cual
  está bien porque todo el acceso es del lado del servidor.

- EN: Only absolute `http(s)` URLs are accepted; a missing or malformed value
  fails fast with an `ApiConfigError` instead of producing a confusing request.
- ES: Solo se aceptan URLs absolutas `http(s)`; un valor ausente o malformado
  falla rápido con un `ApiConfigError` en lugar de producir una petición confusa.

---

## 4. File map / Mapa de archivos

```text
apps/web/
├── lib/api/
│   ├── config.ts        # API_BASE_URL resolution + server-only guard
│   ├── errors.ts        # ApiError, ApiNetworkError, ApiParseError, ApiConfigError
│   ├── client.ts        # apiRequest / apiFetch (typed JSON transport)
│   ├── guards.ts        # runtime shape validation of responses
│   ├── projects.ts      # listProjects, getProjectBySlug
│   ├── experience.ts    # listExperience
│   ├── skills.ts        # listSkills
│   ├── contact.ts       # submitContactMessage + ContactMessageInput
│   ├── health.ts        # getHealth
│   └── index.ts         # public entry point
├── features/contact/
│   ├── types.ts         # ContactFormState and field error codes
│   ├── validation.ts    # mirrors backend domain invariants
│   └── action.ts        # 'use server' submitContactMessageAction
└── test/                # unit tests + opt-in live integration test
```

---

## 5. Data fetching model / Modelo de obtención de datos

EN: The layer is server-first on purpose:

ES: La capa es server-first a propósito:

- EN: Reads (projects, experience, skills, health) are meant to run in **Server
  Components**: no client JavaScript, no API origin in the browser, and the data
  is available for the first render.
- ES: Las lecturas (projects, experience, skills, health) están pensadas para
  ejecutarse en **Server Components**: sin JavaScript de cliente, sin origen de
  API en el navegador y con los datos disponibles en el primer render.
- EN: The contact write runs in a **Server Action**: it works with and without
  JavaScript, and it keeps the API base URL server-only.
- ES: La escritura de contacto se ejecuta en una **Server Action**: funciona con y
  sin JavaScript, y mantiene la URL base de la API solo en el servidor.
- EN: `fetch` is pinned to `cache: 'no-store'`. Next.js 16 already does not cache
  `fetch` by default, but pinning the policy keeps the layer independent from
  framework defaults. If a screen later needs caching, pass `cache` per call
  (the option is already part of `ApiRequestOptions`).
- ES: `fetch` está fijado a `cache: 'no-store'`. Next.js 16 ya no cachea `fetch`
  por defecto, pero fijar la política mantiene la capa independiente de los
  valores por defecto del framework. Si una pantalla luego necesita caché, pasa
  `cache` por llamada (la opción ya forma parte de `ApiRequestOptions`).

EN: No client-side `fetch` helper is exposed today, because no client component
needs one. Adding one later would require a `NEXT_PUBLIC_` variable and a CORS
origin; the API already allows the browser origin (`WEB_ORIGIN`) for `GET`/`POST`.

ES: Hoy no se expone ningún helper `fetch` de cliente, porque ningún componente
de cliente lo necesita. Añadir uno después requeriría una variable
`NEXT_PUBLIC_` y un origen CORS; la API ya permite el origen del navegador
(`WEB_ORIGIN`) para `GET`/`POST`.

---

## 6. Error handling / Manejo de errores

EN: Every failure is normalized, so callers branch on a small known set:

ES: Cada fallo se normaliza, así que los llamadores ramifican sobre un conjunto
pequeño y conocido:

| Error | When | Typical reaction |
| --- | --- | --- |
| `ApiConfigError` | Missing/invalid `API_BASE_URL`, or imported in the browser | Fix configuration (developer error) |
| `ApiError` | API answered a non-2xx status | Show message from `body.message`, or a fallback |
| `ApiNetworkError` | Request never reached the API | Show a retry/offline state |
| `ApiParseError` | Body is not JSON, or shape does not match the contract | Treat as a bug, show a generic error |

- EN: `getProjectBySlug` returns `null` for `404` (unknown project) and `400`
  (non-canonical slug), so a normal miss becomes a "not found" screen instead of a
  crash. Every other status still throws.
- ES: `getProjectBySlug` devuelve `null` para `404` (proyecto desconocido) y `400`
  (slug no canónico), así que un fallo normal se convierte en una pantalla "no
  encontrado" en lugar de una caída. Cualquier otro estado sí lanza.
- EN: `getHealth` treats `503` as **valid data** (API up, database down); only
  unexpected statuses throw.
- ES: `getHealth` trata `503` como **dato válido** (API arriba, base de datos
  caída); solo lanzan los estados inesperados.

EN: Presentation decides the wording. The layer returns codes/objects, never UI
copy.

ES: La presentación decide el texto. La capa devuelve códigos/objetos, nunca texto
de interfaz.

---

## 7. Contact form / Formulario de contacto

EN: `POST /api/v1/contact` receives `{ name, email, message }`. The flow in
`features/contact/action.ts` is:

ES: `POST /api/v1/contact` recibe `{ name, email, message }`. El flujo en
`features/contact/action.ts` es:

1. EN: Validate on the client, mirroring the backend value objects (`ShortText`,
   `EmailAddress`, `LongText`) in `apps/api/src/domain/shared/value-objects`.
   ES: Validar en el cliente, reflejando los value objects del backend
   (`ShortText`, `EmailAddress`, `LongText`) en
   `apps/api/src/domain/shared/value-objects`.
2. EN: Submit through `submitContactMessage`.
   ES: Enviar mediante `submitContactMessage`.
3. EN: Map the outcome to `ContactFormState`.
   ES: Mapear el resultado a `ContactFormState`.

- EN: `success` is produced **only** after the API answers `201` with
  `{ status: "received" }`. The UI may then say the message was *received*; it
  must never claim an email was sent (the backend does not send one).
- ES: `success` se produce **solo** después de que la API responde `201` con
  `{ status: "received" }`. La interfaz puede entonces decir que el mensaje fue
  *recibido*; nunca debe afirmar que se envió un correo (el backend no envía
  ninguno).
- EN: Field errors are machine-readable codes (`required`, `too-long`,
  `invalid-format`, `invalid-characters`) so the presentation layer owns the
  wording and can localize it.
- ES: Los errores de campo son códigos legibles por máquina (`required`,
  `too-long`, `invalid-format`, `invalid-characters`) para que la capa de
  presentación sea dueña del texto y pueda localizarlo.
- EN: **No PII is logged.** The action never logs field values; the API records
  its own errors.
- ES: **No se registra información personal.** La action nunca registra los
  valores de los campos; la API registra sus propios errores.
- EN: The action is designed for React's `useActionState`, which prevents
  accidental duplicate submissions through its pending state (disable the submit
  button while pending).
- ES: La action está pensada para el `useActionState` de React, que evita envíos
  duplicados accidentales mediante su estado pendiente (deshabilitar el botón de
  envío mientras está pendiente).

The exact UI for the form does not exist yet; see
[missing-ui.md](./missing-ui.md).

La interfaz exacta del formulario aún no existe; ver
[missing-ui.md](./missing-ui.md).

---

## 8. Running and verifying / Ejecutar y verificar

EN: Start the database and the API first, then the frontend:

ES: Inicia la base de datos y la API primero, luego el frontend:

```bash
# 1. PostgreSQL
npm run db:up

# 2. API (http://localhost:3001) — applies pending migrations, then watches
npm run dev:api

# 3. Frontend (http://localhost:3000)
npm run dev:web
```

EN: Checks:

ES: Comprobaciones:

```bash
# Type-check, lint and unit tests of the frontend API layer
npm run typecheck --workspace @cantantes/web
npm run lint      --workspace @cantantes/web
npm run test      --workspace @cantantes/web

# Opt-in live integration test (API + PostgreSQL running): proves connectivity
# with the real contracts, using the same client the frontend uses.
API_INTEGRATION_BASE_URL=http://localhost:3001 npm run test --workspace @cantantes/web
```

EN: On Windows PowerShell, set the variable first:
`$env:API_INTEGRATION_BASE_URL='http://localhost:3001'; npm run test --workspace @cantantes/web`.

ES: En Windows PowerShell, define primero la variable:
`$env:API_INTEGRATION_BASE_URL='http://localhost:3001'; npm run test --workspace @cantantes/web`.

---

## 9. Rules that keep this maintainable / Reglas que mantienen esto mantenible

- EN: One place builds URLs and one place speaks HTTP (`client.ts`). No resource
  module calls `fetch` directly.
- ES: Un solo lugar construye URLs y uno solo habla HTTP (`client.ts`). Ningún
  módulo de recurso llama a `fetch` directamente.
- EN: Shared contracts are imported from `@cantantes/types`; they are never
  redefined in the frontend.
- ES: Los contratos compartidos se importan de `@cantantes/types`; nunca se
  redefinen en el frontend.
- EN: The layer holds no business rules and no React/Next code, so it is testable
  and reusable.
- ES: La capa no contiene reglas de negocio ni código de React/Next, así que es
  testeable y reutilizable.
- EN: Business data is never invented: an empty table is an empty array.
- ES: Los datos de negocio nunca se inventan: una tabla vacía es un arreglo vacío.
