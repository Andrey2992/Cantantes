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
import { DomainError } from '../../domain/project/errors/DomainError.js';

/** Fixed reason phrases, so clients never depend on framework wording. */
const REASON_PHRASE: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
};

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

/**
 * Single translation point from failures to HTTP responses.
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
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

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

function internalErrorBody(): ApiErrorResponse {
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    error: reasonPhrase(HttpStatus.INTERNAL_SERVER_ERROR),
    message: INTERNAL_ERROR_MESSAGE,
  };
}

function reasonPhrase(status: number): string {
  return REASON_PHRASE[status] ?? 'Error';
}

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
