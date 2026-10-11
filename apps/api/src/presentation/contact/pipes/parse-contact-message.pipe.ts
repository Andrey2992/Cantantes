import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import type { SubmitContactMessageInput } from '../../../application/contact/use-cases/submit-contact-message.js';
import { DomainError } from '../../../domain/shared/errors/DomainError.js';
import { EmailAddress } from '../../../domain/shared/value-objects/EmailAddress.js';
import { LongText } from '../../../domain/shared/value-objects/LongText.js';
import { ShortText } from '../../../domain/shared/value-objects/ShortText.js';

/** EN: Length bound for the sender name (mirrors the entity). / ES: Límite de longitud del nombre del remitente (refleja la entidad). */
const NAME_MAX_LENGTH = 120;
/** EN: Length bound for the message body (mirrors the entity). / ES: Límite de longitud del cuerpo del mensaje (refleja la entidad). */
const MESSAGE_MAX_LENGTH = 4000;

/**
 * EN: Validates the `POST /api/v1/contact` body by running every field through
 * the domain value objects, mirroring how `ParseProjectSlugPipe` reuses domain
 * rules for the route parameter.
 *
 * A malformed body is a client error, so it becomes `400` with a stable message
 * that names the field but never echoes the rejected input. The result is the
 * use case's validated input contract; raw HTTP data never reaches the
 * application layer.
 *
 * ES: Valida el cuerpo de `POST /api/v1/contact` pasando cada campo por los value
 * objects de dominio, imitando cómo `ParseProjectSlugPipe` reutiliza las reglas
 * de dominio para el parámetro de ruta.
 *
 * Un cuerpo malformado es un error de cliente, así que se convierte en `400` con
 * un mensaje estable que nombra el campo pero nunca repite la entrada rechazada.
 * El resultado es el contrato de entrada validado del caso de uso; los datos HTTP
 * crudos nunca llegan a la capa de aplicación.
 */
@Injectable()
export class ParseContactMessagePipe implements PipeTransform<
  unknown,
  SubmitContactMessageInput
> {
  transform(value: unknown): SubmitContactMessageInput {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const body = value as Record<string, unknown>;

    return {
      name: parseName(body.name),
      email: parseEmail(body.email),
      message: parseMessage(body.message),
    };
  }
}

/**
 * EN: Parses and validates the sender name field.
 * @param raw Unknown value from the HTTP body.
 * @returns A valid {@link ShortText}.
 * @throws {BadRequestException} With a stable message when the value is invalid.
 *
 * ES: Parsea y valida el campo del nombre del remitente.
 * @param raw Valor desconocido del cuerpo HTTP.
 * @returns Un {@link ShortText} válido.
 * @throws {BadRequestException} Con un mensaje estable cuando el valor no es válido.
 */
function parseName(raw: unknown): ShortText {
  try {
    return ShortText.of(raw as string, {
      field: 'Contact name',
      maxLength: NAME_MAX_LENGTH,
    });
  } catch (error) {
    throwInvalidRequest(error, 'Invalid name');
  }
}

/**
 * EN: Parses and validates the sender email field.
 * @param raw Unknown value from the HTTP body.
 * @returns A valid {@link EmailAddress}.
 * @throws {BadRequestException} With a stable message when the value is invalid.
 *
 * ES: Parsea y valida el campo del correo del remitente.
 * @param raw Valor desconocido del cuerpo HTTP.
 * @returns Un {@link EmailAddress} válido.
 * @throws {BadRequestException} Con un mensaje estable cuando el valor no es válido.
 */
function parseEmail(raw: unknown): EmailAddress {
  try {
    return EmailAddress.of(raw as string);
  } catch (error) {
    throwInvalidRequest(error, 'Invalid email address');
  }
}

/**
 * EN: Parses and validates the message body field.
 * @param raw Unknown value from the HTTP body.
 * @returns A valid {@link LongText}.
 * @throws {BadRequestException} With a stable message when the value is invalid.
 *
 * ES: Parsea y valida el campo del cuerpo del mensaje.
 * @param raw Valor desconocido del cuerpo HTTP.
 * @returns Un {@link LongText} válido.
 * @throws {BadRequestException} Con un mensaje estable cuando el valor no es válido.
 */
function parseMessage(raw: unknown): LongText {
  try {
    return LongText.of(raw as string, {
      field: 'Contact message',
      maxLength: MESSAGE_MAX_LENGTH,
    });
  } catch (error) {
    throwInvalidRequest(error, 'Invalid message');
  }
}

/**
 * EN: Translates a {@link DomainError} into a `400` with a fixed message. Any
 * other error is re-thrown so real failures keep their identity.
 *
 * ES: Traduce un {@link DomainError} a un `400` con un mensaje fijo. Cualquier
 * otro error se vuelve a lanzar para que las fallas reales conserven su
 * identidad.
 */
function throwInvalidRequest(error: unknown, message: string): never {
  if (error instanceof DomainError) {
    throw new BadRequestException(message);
  }

  throw error;
}
