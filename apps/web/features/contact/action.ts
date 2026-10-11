'use server';

import { submitContactMessage } from '../../lib/api';
import type { ContactFormState } from './types';
import { validateContactFields } from './validation';

/**
 * EN: Server Action that submits the contact form.
 *
 * Why an action instead of a browser `fetch`: the API base URL stays server-only
 * (`API_BASE_URL` has no `NEXT_PUBLIC_` prefix), so no API origin is shipped to
 * the client, and the same code path works without JavaScript. It is designed to
 * be used with React's `useActionState`, which supplies the previous state and the
 * form data.
 *
 * Flow: validate → submit through the API layer → map the outcome to a state.
 * Only a confirmed backend acknowledgment yields `success`; no email is ever
 * claimed, and no field value is logged (see `docs/frontend/api-integration.md`).
 *
 * ES: Server Action que envía el formulario de contacto.
 *
 * Por qué una action en vez de un `fetch` del navegador: la URL base de la API
 * permanece solo en el servidor (`API_BASE_URL` no lleva el prefijo
 * `NEXT_PUBLIC_`), así que no se envía ningún origen de API al cliente y el mismo
 * camino funciona sin JavaScript. Está pensada para usarse con el `useActionState`
 * de React, que aporta el estado previo y los datos del formulario.
 *
 * Flujo: validar → enviar por la capa de API → mapear el resultado a un estado.
 * Solo un acuse confirmado del backend produce `success`; nunca se afirma que se
 * envió un correo y no se registra ningún valor de campo (ver
 * `docs/frontend/api-integration.md`).
 */

/** EN: Safe, non-revealing message for an unexpected failure. / ES: Mensaje seguro y no revelador para un fallo inesperado. */
const SUBMISSION_ERROR_MESSAGE =
  'We could not submit your message right now. Please try again later.';

/**
 * EN: Validates and submits a contact form.
 *
 * @param _previousState State returned by the previous submit. Required by the
 * `useActionState` contract; this action is stateless and does not read it.
 * @param formData Raw form values (`name`, `email`, `message`).
 * @returns `invalid` with per-field codes when local validation fails, `success`
 * after a confirmed acknowledgment, or a generic `error` state otherwise.
 *
 * ES: Valida y envía un formulario de contacto.
 *
 * @param _previousState Estado devuelto por el envío anterior. Requerido por el
 * contrato de `useActionState`; esta action es sin estado y no lo lee.
 * @param formData Valores crudos del formulario (`name`, `email`, `message`).
 * @returns `invalid` con códigos por campo cuando falla la validación local,
 * `success` tras un acuse confirmado, o un estado `error` genérico en otro caso.
 */
export async function submitContactMessageAction(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const validation = validateContactFields({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validation.ok) {
    return { status: 'invalid', errors: validation.errors };
  }

  try {
    await submitContactMessage(validation.value);

    return { status: 'success' };
  } catch {
    // The API layer already normalizes every failure (network, parse, HTTP).
    // Nothing about the submission is logged; the API records its own errors.
    return { status: 'error', message: SUBMISSION_ERROR_MESSAGE };
  }
}
