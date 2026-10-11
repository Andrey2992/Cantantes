import type { ApiErrorResponse } from '@cantantes/types';

/**
 * EN: Error hierarchy of the frontend API layer.
 *
 * The layer never lets a raw `fetch`/JSON failure escape: every failure is
 * normalized into one of these classes so callers (Server Components, Server
 * Actions) can branch on a small, known set instead of guessing. They carry no
 * UI text; presentation decides how to phrase things.
 *
 * ES: Jerarquía de errores de la capa de API del frontend.
 *
 * La capa nunca deja escapar un fallo crudo de `fetch`/JSON: cada fallo se
 * normaliza en una de estas clases para que los llamadores (Server Components,
 * Server Actions) ramifiquen sobre un conjunto pequeño y conocido en vez de
 * adivinar. No transportan texto de interfaz; la presentación decide cómo
 * redactarlo.
 */

/**
 * EN: Thrown when `API_BASE_URL` is missing, empty or not a valid http(s) URL,
 * or when the layer is imported in a browser bundle.
 *
 * It is a configuration fault, not a request failure, so it should surface
 * loudly during development instead of being shown to a visitor.
 *
 * ES: Se lanza cuando `API_BASE_URL` falta, está vacía o no es una URL http(s)
 * válida, o cuando la capa se importa en un bundle de navegador.
 *
 * Es una falla de configuración, no de petición, así que debe aparecer de forma
 * ruidosa en desarrollo en lugar de mostrarse a un visitante.
 */
export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigError';
  }
}

/**
 * EN: Thrown when the API answers a non-2xx status.
 *
 * `body` is the parsed `{ statusCode, error, message }` envelope when the server
 * sent one, or `null` when it did not (for example a proxy HTML error page).
 * `message` is safe to display: it comes from the server's fixed error envelope
 * or a constant fallback, never from a stack trace.
 *
 * ES: Se lanza cuando la API responde un estado distinto de 2xx.
 *
 * `body` es el envoltorio `{ statusCode, error, message }` parseado cuando el
 * servidor envió uno, o `null` cuando no lo hizo (por ejemplo una página HTML de
 * error de un proxy). `message` es seguro para mostrar: proviene del envoltorio
 * de error fijo del servidor o de un valor de reserva constante, nunca de un
 * stack trace.
 */
export class ApiError extends Error {
  /** EN: HTTP status code returned by the API. / ES: Código de estado HTTP devuelto por la API. */
  readonly status: number;
  /** EN: Parsed error envelope, or `null` if the body was absent/not JSON. / ES: Envoltorio de error parseado, o `null` si el cuerpo faltó o no era JSON. */
  readonly body: ApiErrorResponse | null;

  constructor(status: number, body: ApiErrorResponse | null, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * EN: Thrown when the request never reached the API or the connection failed
 * (DNS, refused connection, timeout, aborted signal).
 *
 * `cause` keeps the original rejection for debugging; it is never rendered.
 *
 * ES: Se lanza cuando la petición nunca llegó a la API o la conexión falló (DNS,
 * conexión rechazada, timeout, señal abortada).
 *
 * `cause` conserva el rechazo original para depurar; nunca se renderiza.
 */
export class ApiNetworkError extends Error {
  /** EN: Original rejection, kept for diagnostics only. / ES: Rechazo original, conservado solo para diagnóstico. */
  override readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ApiNetworkError';
    this.cause = cause;
  }
}

/**
 * EN: Thrown when a response cannot be trusted: the body is not JSON, or a
 * successful body does not match the expected contract shape.
 *
 * Keeping this distinct from {@link ApiError} matters: a non-2xx status is a
 * legitimate answer, while an unparsable or malformed body is a protocol bug.
 *
 * ES: Se lanza cuando una respuesta no es confiable: el cuerpo no es JSON, o un
 * cuerpo exitoso no coincide con la forma esperada del contrato.
 *
 * Mantenerlo separado de {@link ApiError} importa: un estado distinto de 2xx es
 * una respuesta legítima, mientras que un cuerpo no parseable o malformado es un
 * fallo de protocolo.
 */
export class ApiParseError extends Error {
  /** EN: HTTP status whose body failed to parse/validate. / ES: Estado HTTP cuyo cuerpo falló al parsear/validar. */
  readonly status: number;
  /** EN: Original error, when one exists. / ES: Error original, cuando existe. */
  override readonly cause: unknown;

  constructor(status: number, message: string, cause?: unknown) {
    super(message);
    this.name = 'ApiParseError';
    this.status = status;
    this.cause = cause;
  }
}

/** EN: Narrows an unknown value to {@link ApiConfigError}. / ES: Restringe un valor desconocido a {@link ApiConfigError}. */
export function isApiConfigError(error: unknown): error is ApiConfigError {
  return error instanceof ApiConfigError;
}

/** EN: Narrows an unknown value to {@link ApiError}. / ES: Restringe un valor desconocido a {@link ApiError}. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** EN: Narrows an unknown value to {@link ApiNetworkError}. / ES: Restringe un valor desconocido a {@link ApiNetworkError}. */
export function isApiNetworkError(error: unknown): error is ApiNetworkError {
  return error instanceof ApiNetworkError;
}

/** EN: Narrows an unknown value to {@link ApiParseError}. / ES: Restringe un valor desconocido a {@link ApiParseError}. */
export function isApiParseError(error: unknown): error is ApiParseError {
  return error instanceof ApiParseError;
}
