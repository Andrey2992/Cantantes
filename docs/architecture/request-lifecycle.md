# Request lifecycle / Ciclo de vida de una petición

EN: This document follows one concrete request through every layer, using the
real files of the API.

ES: Este documento sigue una petición concreta por cada capa, usando los archivos
reales de la API.

## Example: `GET /api/v1/projects/sade`

### 1. HTTP entry / Entrada HTTP

- EN: `main.ts` boots the Nest app and calls `configureApp(app)`.
- ES: `main.ts` arranca la app Nest y llama `configureApp(app)`.
- EN: `bootstrap/configure-app.ts` sets the global prefix `api`, enables URI
  versioning with default `v1`, configures CORS and shutdown hooks.
- ES: `bootstrap/configure-app.ts` fija el prefijo global `api`, habilita el
  versionado por URI con `v1` por defecto, configura CORS y los hooks de apagado.

So the public URL is `/api` + `/v1` + `/projects/sade`.

### 2. Routing / Enrutado

- EN: `ProjectsController` (`@Controller('projects')`) matches `@Get(':slug')`.
- ES: `ProjectsController` (`@Controller('projects')`) coincide con `@Get(':slug')`.

### 3. Validation (pipe) / Validación (pipe)

- EN: `ParseProjectSlugPipe` receives the raw `:slug` string and runs it through
  `ProjectSlug.of(...)` (a domain value object).
- EN: On success it returns a `ProjectSlug`; on a `DomainError` it throws
  `BadRequestException('Invalid project slug')` → `400`.
- ES: `ParseProjectSlugPipe` recibe la cadena cruda `:slug` y la pasa por
  `ProjectSlug.of(...)` (un value object de dominio).
- ES: Si tiene éxito devuelve un `ProjectSlug`; ante un `DomainError` lanza
  `BadRequestException('Invalid project slug')` → `400`.

### 4. Controller → use case / Controlador → caso de uso

- EN: `ProjectsController.detail(slug)` calls `GetProject.execute(slug)`.
- ES: `ProjectsController.detail(slug)` llama a `GetProject.execute(slug)`.

### 5. Application (use case) / Aplicación (caso de uso)

- EN: `GetProject` calls `ProjectRepository.findBySlug(slug)`.
- EN: If the repository returns `null`, it throws `ProjectNotFoundError`.
- ES: `GetProject` llama a `ProjectRepository.findBySlug(slug)`.
- ES: Si el repositorio devuelve `null`, lanza `ProjectNotFoundError`.

### 6. Infrastructure (repository) / Infraestructura (repositorio)

- EN: `PrismaProjectRepository.findBySlug` runs `prisma.project.findUnique({ where: { slug } })`.
- EN: It maps the row with `toDomain(row)`, which calls `Project.restore(...)` and
  re-validates every invariant.
- ES: `PrismaProjectRepository.findBySlug` ejecuta `prisma.project.findUnique({ where: { slug } })`.
- ES: Mapea la fila con `toDomain(row)`, que llama `Project.restore(...)` y
  re-valida cada invariante.

### 7. Domain / Dominio

- EN: `Project.restore` builds the aggregate from primitives, enforcing rules via
  `ProjectId`, `ProjectSlug`, `ProjectTitle`, `ProjectTheme`.
- ES: `Project.restore` construye el agregado desde primitivas, aplicando reglas
  mediante `ProjectId`, `ProjectSlug`, `ProjectTitle`, `ProjectTheme`.

### 8. Back up the stack / De vuelta hacia arriba

- EN: The aggregate returns to `GetProject`, then to the controller.
- EN: `toProjectResponse(project)` maps it to the shared contract
  (`ProjectResponse`).
- ES: El agregado vuelve a `GetProject`, luego al controlador.
- ES: `toProjectResponse(project)` lo mapea al contrato compartido
  (`ProjectResponse`).

### 9. Error handling / Manejo de errores

- EN: `AllExceptionsFilter` is the single translation point. It maps
  `ProjectNotFoundError` → `404`, `DomainError` → `400`, other `HttpException`
  `4xx` keep their message, and anything `5xx`/unknown → constant `500`. Internal
  failures are logged server-side with their stack; the client never receives the
  stack, SQL or credentials.
- ES: `AllExceptionsFilter` es el único punto de traducción. Mapea
  `ProjectNotFoundError` → `404`, `DomainError` → `400`, otras `HttpException`
  `4xx` conservan su mensaje, y cualquier `5xx`/desconocido → `500` constante. Los
  fallos internos se registran en el servidor con su stack; el cliente nunca recibe
  el stack, el SQL ni las credenciales.

## Example: `POST /api/v1/contact`

- EN: `ContactController.submit` uses `ParseContactMessagePipe` on `@Body()`.
- EN: The pipe validates each field into domain value objects (`ShortText`,
  `EmailAddress`, `LongText`) and returns the use-case input contract. Invalid
  input → `400` with a fixed message and no echo of the rejected value.
- EN: `SubmitContactMessage.execute` asks `IdGenerator.next()` for an id, builds
  `ContactMessage.create(...)` and calls `ContactMessageRepository.save(message)`.
- EN: The controller answers `201 { "status": "received" }`. No email is sent.
- ES: `ContactController.submit` usa `ParseContactMessagePipe` sobre `@Body()`.
- ES: El pipe valida cada campo hacia value objects de dominio (`ShortText`,
  `EmailAddress`, `LongText`) y devuelve el contrato de entrada del caso de uso.
  Entrada inválida → `400` con mensaje fijo y sin repetir el valor rechazado.
- ES: `SubmitContactMessage.execute` pide un id a `IdGenerator.next()`, construye
  `ContactMessage.create(...)` y llama `ContactMessageRepository.save(message)`.
- ES: El controlador responde `201 { "status": "received" }`. No se envía correo.

## Example: `GET /api/health`

- EN: Version-neutral route. `CheckHealth.execute()` calls `HealthProbe.check()`,
  which runs `SELECT 1`. The controller sets `200` (`ok`/`up`) or `503`
  (`degraded`/`down`) through a passthrough response, keeping the `HealthResponse`
  body shape.
- ES: Ruta neutra en versión. `CheckHealth.execute()` llama a `HealthProbe.check()`,
  que ejecuta `SELECT 1`. El controlador fija `200` (`ok`/`up`) o `503`
  (`degraded`/`down`) mediante una respuesta passthrough, conservando la forma de
  cuerpo `HealthResponse`.
