/**
 * EN: Test helpers for the frontend API layer.
 *
 * The client accepts a `fetchImpl`, so tests never touch the network. This
 * harness records every call and returns whatever the test's handler produces.
 *
 * ES: Utilidades de prueba para la capa de API del frontend.
 *
 * El cliente acepta un `fetchImpl`, así que las pruebas nunca tocan la red. Este
 * arnés registra cada llamada y devuelve lo que produzca el manejador de la prueba.
 */

/** EN: A recorded `fetch` call. / ES: Una llamada a `fetch` registrada. */
export interface RecordedFetchCall {
  readonly url: string;
  readonly init: RequestInit | undefined;
}

/** EN: JSON `Response` factory. / ES: Fábrica de `Response` JSON. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/** EN: Plain-text `Response` factory (for non-JSON bodies). / ES: Fábrica de `Response` de texto plano (para cuerpos no JSON). */
export function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain' },
  });
}

/**
 * EN: Builds a `fetch` double.
 *
 * @param handler Produces the response for each call; may throw to simulate a
 * network failure.
 * @returns The implementation to pass as `fetchImpl`, plus the recorded calls.
 *
 * ES: Construye un doble de `fetch`.
 *
 * @param handler Produce la respuesta de cada llamada; puede lanzar para simular un
 * fallo de red.
 * @returns La implementación para pasar como `fetchImpl`, más las llamadas
 * registradas.
 */
export function createFetchMock(
  handler: (url: URL, init: RequestInit | undefined) => Response | Promise<Response>,
): { readonly impl: typeof fetch; readonly calls: RecordedFetchCall[] } {
  const calls: RecordedFetchCall[] = [];

  const impl = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = input instanceof URL ? input : new URL(String(input));
    calls.push({ url: url.toString(), init });

    return handler(url, init);
  };

  return { impl: impl as typeof fetch, calls };
}

/** EN: Reads a JSON request body from a recorded call. / ES: Lee un cuerpo de petición JSON de una llamada registrada. */
export function readJsonBody(call: RecordedFetchCall): unknown {
  return typeof call.init?.body === 'string'
    ? JSON.parse(call.init.body)
    : undefined;
}
