import type { ContactReceivedResponse } from '@cantantes/types';
import { apiFetch, type ApiRequestOptions } from './client';
import { ApiParseError } from './errors';
import { isContactReceivedResponse } from './guards';

/**
 * EN: Contact resource of the API integration layer.
 *
 * The write side of the integration. The backend validates the body again with
 * its own domain value objects; this layer only transports the fields, so client
 * and server agree on the shape `{ name, email, message }`.
 *
 * ES: Recurso Contact de la capa de integración de API.
 *
 * El lado de escritura de la integración. El backend vuelve a validar el cuerpo
 * con sus propios value objects de dominio; esta capa solo transporta los campos,
 * de modo que cliente y servidor coinciden en la forma `{ name, email, message }`.
 */

/**
 * EN: Request body of `POST /api/v1/contact`.
 *
 * Intentionally frontend-local instead of living in `@cantantes/types`: the
 * backend models these three fields as domain value objects, not as a shared
 * request DTO, so there is nothing genuinely shared to reuse (`AGENTS.md` §16).
 *
 * ES: Cuerpo de la petición `POST /api/v1/contact`.
 *
 * Deliberadamente local al frontend en vez de vivir en `@cantantes/types`: el
 * backend modela estos tres campos como value objects de dominio, no como un DTO
 * de petición compartido, así que no hay nada realmente compartido que reutilizar
 * (`AGENTS.md` §16).
 */
export interface ContactMessageInput {
  /** EN: Sender name. / ES: Nombre del remitente. */
  readonly name: string;
  /** EN: Sender email address. / ES: Correo del remitente. */
  readonly email: string;
  /** EN: Message body. / ES: Cuerpo del mensaje. */
  readonly message: string;
}

/**
 * EN: Submits a contact message.
 *
 * The promise resolves only after the backend confirms it stored the message
 * (`201` with `{ status: "received" }`). It never claims an email was sent: the
 * backend does not send one.
 *
 * @param input Validated sender data, see {@link ContactMessageInput}.
 * @param options Optional request options.
 * @returns The backend acknowledgment.
 * @throws {ApiError} On a non-2xx status, including a `400` when the backend
 * rejects a field.
 * @throws {ApiNetworkError} When the API is unreachable.
 * @throws {ApiParseError} When the acknowledgment shape is unexpected.
 *
 * ES: Envía un mensaje de contacto.
 *
 * La promesa se resuelve solo después de que el backend confirma que almacenó el
 * mensaje (`201` con `{ status: "received" }`). Nunca afirma que se envió un
 * correo: el backend no envía ninguno.
 *
 * @param input Datos validados del remitente, ver {@link ContactMessageInput}.
 * @param options Opciones de petición opcionales.
 * @returns El acuse del backend.
 * @throws {ApiError} Con un estado distinto de 2xx, incluido un `400` cuando el
 * backend rechaza un campo.
 * @throws {ApiNetworkError} Cuando la API es inalcanzable.
 * @throws {ApiParseError} Cuando la forma del acuse es inesperada.
 */
export async function submitContactMessage(
  input: ContactMessageInput,
  options?: ApiRequestOptions,
): Promise<ContactReceivedResponse> {
  const data = await apiFetch<unknown>('/api/v1/contact', {
    ...options,
    method: 'POST',
    body: input,
  });

  if (!isContactReceivedResponse(data)) {
    throw new ApiParseError(
      201,
      'Malformed contact acknowledgment from the API.',
    );
  }

  return data;
}
