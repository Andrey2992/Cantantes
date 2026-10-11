# Module: Contact / Módulo: Contact

## Purpose / Propósito

EN: Write-only bounded context for the portfolio contact form. It validates a
message and stores it. It does **not** send email and it does **not** log message
contents, the sender's email or any other PII.

ES: Contexto delimitado de solo escritura para el formulario de contacto del
portafolio. Valida un mensaje y lo almacena. **No** envía correo y **no** registra
el contenido del mensaje, el correo del remitente ni otros datos personales.

## Files / Archivos

| Layer | File |
| --- | --- |
| Domain | `domain/contact/entities/ContactMessage.ts` |
| Domain | `domain/contact/repositories/ContactMessageRepository.ts` |
| Application | `application/contact/use-cases/submit-contact-message.ts` |
| Application | `application/contact/contact-message-repository.token.ts` |
| Application | `application/shared/ports/id-generator.ts` |
| Infrastructure | `infrastructure/repositories/prisma-contact-message.repository.ts` |
| Infrastructure | `infrastructure/id-generation/crypto-id-generator.ts` |
| Presentation | `presentation/contact/contact.controller.ts` |
| Presentation | `presentation/contact/pipes/parse-contact-message.pipe.ts` |

## Domain / Dominio

EN: `ContactMessage` is an aggregate root with a private constructor and a single
`create` factory. It is append-only (no `edit`/`delete`) and carries `submittedAt`
as domain data. It composes `EntityId`, `ShortText`, `EmailAddress` and `LongText`.

ES: `ContactMessage` es una raíz de agregado con constructor privado y una sola
fábrica `create`. Es de solo anexado (sin `edit`/`delete`) y lleva `submittedAt`
como dato de dominio. Compone `EntityId`, `ShortText`, `EmailAddress` y `LongText`.

### Invariants / Invariantes

| Field | Rule | EN | ES |
| --- | --- | --- | --- |
| `id` | UUID | Identity | Identidad |
| `name` | non-empty, ≤ 120 | Sender name | Nombre del remitente |
| `email` | valid address | Sender email | Correo del remitente |
| `message` | non-empty, ≤ 4000 | Body | Cuerpo |
| `submittedAt` | set at creation | Submission instant | Instante de envío |

> EN: `create(props, now = new Date())` takes the instant as a parameter so tests
> are deterministic.
>
> ES: `create(props, now = new Date())` recibe el instante como parámetro para que
> las pruebas sean deterministas.

## Application / Aplicación

EN: `SubmitContactMessage` is a use case that:
1. asks the `IdGenerator` port for a new identity;
2. builds a validated `ContactMessage`;
3. persists it through `ContactMessageRepository`.
It does nothing else — no email is sent.

ES: `SubmitContactMessage` es un caso de uso que:
1. pide una identidad nueva al puerto `IdGenerator`;
2. construye un `ContactMessage` validado;
3. lo persiste a través de `ContactMessageRepository`.
No hace nada más — no se envía correo.

## Infrastructure / Infraestructura

EN: `PrismaContactMessageRepository.save` inserts a single row with `create` (not
`upsert`) because every message has a fresh identity. `CryptoIdGenerator` produces
UUIDs via `node:crypto`.

ES: `PrismaContactMessageRepository.save` inserta una sola fila con `create` (no
`upsert`) porque cada mensaje tiene identidad nueva. `CryptoIdGenerator` produce
UUIDs mediante `node:crypto`.

## Presentation / Presentación

- EN: `POST /api/v1/contact` → `submit(@Body(ParseContactMessagePipe) input)`.
- EN: `ParseContactMessagePipe` validates each field into a domain value object
  and returns `SubmitContactMessageInput`; invalid input → `400` with a fixed
  message that never echoes the rejected value.
- EN: The controller answers `201 { "status": "received" }`.
- ES: `POST /api/v1/contact` → `submit(@Body(ParseContactMessagePipe) input)`.
- ES: `ParseContactMessagePipe` valida cada campo hacia un value object de dominio
  y devuelve `SubmitContactMessageInput`; entrada inválida → `400` con mensaje fijo
  que nunca repite el valor rechazado.
- ES: El controlador responde `201 { "status": "received" }`.

## Privacy / Privacidad

- EN: The API never logs the message body or the sender email; only internal
  server failures are logged, without request bodies.
- ES: La API nunca registra el cuerpo del mensaje ni el correo del remitente; solo
  se registran fallos internos del servidor, sin cuerpos de petición.

## Tests / Pruebas

- EN: `ContactMessage` spec; `SubmitContactMessage` use-case spec (with a fake
  `IdGenerator`); `ParseContactMessagePipe` spec; `test/contact.e2e-spec.ts` (valid
  → `201`, invalid → `400`).
- ES: Spec de `ContactMessage`; spec del caso de uso `SubmitContactMessage` (con un
  `IdGenerator` falso); spec de `ParseContactMessagePipe`;
  `test/contact.e2e-spec.ts` (válido → `201`, inválido → `400`).
