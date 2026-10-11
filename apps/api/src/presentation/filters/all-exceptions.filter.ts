import type { ApiErrorResponse } from '@cantantes/types';
import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProjectNotFoundError } from '../../application/project/errors/project-not-found.error.js';
import { DomainError } from '../../domain/shared/errors/DomainError.js';

/**
 * EN: Fixed reason phrases, so clients never depend on framework wording.
 *
 * ES: Frases de motivo fijas, para que los clientes nunca dependan del texto del
 * framework.
 */
const REASON_PHRASE: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

/**
 * EN: Single translation point from failures to HTTP responses.
 *
 * Rules (AGENTS.md section 11, plus the "never leak internals" requirement):
 * - Domain and application errors become their declared status with a fixed,
 *   hand-written message.
 * - `4xx` responses keep the message of an `HttpException` that this codebase
 *   raised explicitly, because those messages are written here and never carry
 *   internal detail.
 * - Anything `5xx` or unrecognised is logged with its full stack on the server
 *   and answered with a constant body. Prisma errors, SQL, connection strings and
 *   stack traces never reach the client; translating driver-specific failures is
 *   the repository's job, not the transport's.
 *
 * ES: Único punto de traducción de fallos a respuestas HTTP.
 *
 * Reglas (AGENTS.md sección 11, más el requisito de "nunca filtrar internos"):
 * - Los errores de dominio y de aplicación se convierten en su estado declarado
 *   con un mensaje fijo escrito a mano.
 * - Las respuestas `4xx` conservan el mensaje de una `HttpException` que este
 *   código lanzó explícitamente, porque esos mensajes están escritos aquí y nunca
 *   arrastran detalle interno.
 * - Cualquier cosa `5xx` o no reconocida se registra con su stack completo en el
 *   servidor y se responde con un cuerpo constante. Los errores de Prisma, el SQL,
 *   las cadenas de conexión y los stack traces nunca llegan al cliente; traducir
 *   fallos específicos del driver es trabajo del repositorio, no del transporte.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * EN: Entry point of the filter: builds the error body, logs internal failures
   * and writes the response.
   *
   * @param exception Any value thrown by the application.
   * @param host Nest context used to reach the HTTP request/response pair.
   *
   * ES: Punto de entrada del filtro: construye el cuerpo de error, registra los
   * fallos internos y escribe la respuesta.
   *
   * @param exception Cualquier valor lanzado por la aplicación.
   * @param host Contexto de Nest usado para alcanzar el par petición/respuesta HTTP.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const body = this.toResponseBody(exception);

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  /**
   * EN: Decides the HTTP mapping of an unknown failure.
   *
   * ES: Decide el mapeo HTTP de un fallo desconocido.
   */
  private toResponseBody(exception: unknown): ApiErrorResponse {
    if (exception instanceof ProjectNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: reasonPhrase(HttpStatus.NOT_FOUND),
        message: 'Project not found',
      };
    }

    if (exception instanceof DomainError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        error: reasonPhrase(HttpStatus.BAD_REQUEST),
        message: 'Invalid request',
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        return internalErrorBody();
      }

      return {
        statusCode: status,
        error: reasonPhrase(status),
        message: extractMessage(exception),
      };
    }

    return internalErrorBody();
  }
}

/**
 * EN: Constant `500` envelope so no internal detail can leak.
 *
 * ES: Envoltorio constante de `500` para que ningún detalle interno pueda filtrarse.
 */
function internalErrorBody(): ApiErrorResponse {
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: reasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
    message: INTERNAL_ERROR_MESSAGE,
  };
}

/**
 * EN: Resolves a stable reason phrase for a status code.
 *
 * ES: Resuelve una frase de motivo estable para un código de estado.
 */
function reasonPhrase(status: number): string {
  return REASON_PHRASE[status] ?? 'Error';
}

/**
 * EN: Extracts a safe message from an `HttpException` payload. It prefers the
 * string form, then a `message` property, then a joined string array, and falls
 * back to the exception message.
 *
 * ES: Extrae un mensaje seguro del payload de una `HttpException`. Prefiere la
 * forma de cadena, luego una propiedad `message`, luego un arreglo de cadenas
 * unido, y cae al mensaje de la excepción.
 */
function extractMessage(exception: HttpException): string {
  const payload: unknown = exception.getResponse();

  if (typeof payload === 'string' && payload !== '') {
    return payload;
  }

  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = (payload as { message: unknown }).message;

    if (typeof message === 'string' && message !== '') {
      return message;
    }

    if (Array.isArray(message)) {
      return message
        .filter((item): item is string => typeof item === 'string')
        .join(', ');
    }
  }

  return exception.message;
}
