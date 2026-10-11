/**
 * EN: Types of the contact form feature.
 *
 * They describe the serializable state a Server Action returns to the form. They
 * carry no visual concern: the future Stitch contact form can render them however
 * the design requires.
 *
 * ES: Tipos de la característica del formulario de contacto.
 *
 * Describen el estado serializable que una Server Action devuelve al formulario.
 * No contienen preocupaciones visuales: el futuro formulario de contacto de Stitch
 * puede renderizarlos como el diseño lo requiera.
 */

/** EN: The three fields of the contact form. / ES: Los tres campos del formulario de contacto. */
export type ContactFormField = 'name' | 'email' | 'message';

/**
 * EN: Machine-readable field error codes.
 *
 * Codes, not sentences, so the presentation layer owns the wording and can
 * localize it (EN/ES) without changing validation.
 *
 * ES: Códigos de error de campo legibles por máquina.
 *
 * Códigos, no frases, para que la capa de presentación sea dueña del texto y pueda
 * localizarlo (EN/ES) sin cambiar la validación.
 */
export type ContactFieldErrorCode =
  | 'required'
  | 'too-long'
  | 'invalid-format'
  | 'invalid-characters';

/** EN: Per-field validation errors. / ES: Errores de validación por campo. */
export type ContactFieldErrors = Partial<
  Record<ContactFormField, ContactFieldErrorCode>
>;

/**
 * EN: Result state of a contact submission.
 *
 * `success` is produced only after the backend confirms persistence, so the UI can
 * safely say the message was received (never that an email was sent).
 *
 * ES: Estado resultante de un envío de contacto.
 *
 * `success` se produce solo después de que el backend confirma la persistencia,
 * así que la interfaz puede decir con seguridad que el mensaje fue recibido (nunca
 * que se envió un correo).
 */
export type ContactFormState =
  | { readonly status: 'idle' }
  | { readonly status: 'success' }
  | { readonly status: 'invalid'; readonly errors: ContactFieldErrors }
  | { readonly status: 'error'; readonly message: string };
