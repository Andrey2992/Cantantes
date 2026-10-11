import { EmailAddress } from '../../shared/value-objects/EmailAddress.js';
import { EntityId } from '../../shared/value-objects/EntityId.js';
import { LongText } from '../../shared/value-objects/LongText.js';
import { ShortText } from '../../shared/value-objects/ShortText.js';

/**
 * EN: Raw shape accepted by the aggregate entry point. The sender's name, email
 * and message arrive as primitives and are validated by the matching value
 * objects.
 *
 * ES: Forma cruda aceptada por el punto de entrada del agregado. El nombre, el
 * correo y el mensaje del remitente llegan como primitivas y los validan los
 * value objects correspondientes.
 */
export type ContactMessageProps = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly message: string;
};

/** EN: Maximum length of the sender's name. / ES: Longitud máxima del nombre del remitente. */
const NAME_MAX_LENGTH = 120;
/** EN: Maximum length of the message body. / ES: Longitud máxima del cuerpo del mensaje. */
const MESSAGE_MAX_LENGTH = 4000;

/**
 * EN: A message sent through the portfolio contact form.
 *
 * Design notes:
 * - Private constructor and a single `create` factory: creation and rehydration
 *   apply the same rules, because the aggregate holds no persistence-only state
 *   beyond the submission instant, which is passed in.
 * - It is append-only. There is no `edit` or `delete`: a received message is an
 *   immutable record of what the sender wrote.
 * - It carries `submittedAt` as domain data, not as a persistence detail: the
 *   time a message was received is meaningful to whoever reads it later.
 * - The domain stores the message; it never sends email. Sending is an external
 *   integration that would live in infrastructure and is intentionally absent
 *   (AGENTS.md section 8 and the task's "do not pretend to send emails" rule).
 *
 * ES: Un mensaje enviado mediante el formulario de contacto del portafolio.
 *
 * Notas de diseño:
 * - Constructor privado y una sola fábrica `create`: la creación y la
 *   rehidratación aplican las mismas reglas, porque el agregado no guarda estado
 *   exclusivo de persistencia más allá del instante de envío, que se pasa como
 *   parámetro.
 * - Es de solo anexado. No hay `edit` ni `delete`: un mensaje recibido es un
 *   registro inmutable de lo que escribió el remitente.
 * - Lleva `submittedAt` como dato de dominio, no como detalle de persistencia: el
 *   momento en que se recibió un mensaje es significativo para quien lo lea luego.
 * - El dominio almacena el mensaje; nunca envía correos. El envío es una
 *   integración externa que viviría en infraestructura y está ausente a propósito
 *   (AGENTS.md sección 8 y la regla de la tarea "no pretender enviar correos").
 */
export class ContactMessage {
  readonly id: EntityId;
  readonly submittedAt: Date;

  private readonly senderName: ShortText;
  private readonly senderEmail: EmailAddress;
  private readonly body: LongText;

  private constructor(params: {
    id: EntityId;
    name: ShortText;
    email: EmailAddress;
    message: LongText;
    submittedAt: Date;
  }) {
    this.id = params.id;
    this.senderName = params.name;
    this.senderEmail = params.email;
    this.body = params.message;
    this.submittedAt = params.submittedAt;
  }

  /**
   * EN: Builds a validated contact message.
   * @param props Raw primitives, see {@link ContactMessageProps}.
   * @param now Submission instant. Injectable for deterministic tests; defaults
   * to the current time.
   * @returns A valid `ContactMessage`.
   * @throws {DomainError} If a primitive violates its value-object rule.
   *
   * ES: Construye un mensaje de contacto validado.
   * @param props Primitivas crudas, ver {@link ContactMessageProps}.
   * @param now Instante de envío. Inyectable para pruebas deterministas; por
   * defecto usa la hora actual.
   * @returns Un `ContactMessage` válido.
   * @throws {DomainError} Si una primitiva viola la regla de su value object.
   */
  static create(
    props: ContactMessageProps,
    now: Date = new Date(),
  ): ContactMessage {
    return new ContactMessage({
      id: EntityId.of(props.id),
      name: ShortText.of(props.name, {
        field: 'Contact name',
        maxLength: NAME_MAX_LENGTH,
      }),
      email: EmailAddress.of(props.email),
      message: LongText.of(props.message, {
        field: 'Contact message',
        maxLength: MESSAGE_MAX_LENGTH,
      }),
      submittedAt: now,
    });
  }

  /** EN: Sender name. / ES: Nombre del remitente. */
  get name(): ShortText {
    return this.senderName;
  }

  /** EN: Sender email address. / ES: Dirección de correo del remitente. */
  get email(): EmailAddress {
    return this.senderEmail;
  }

  /** EN: Message body. / ES: Cuerpo del mensaje. */
  get message(): LongText {
    return this.body;
  }

  /** EN: Identity-based equality. / ES: Igualdad basada en la identidad. */
  equals(other: ContactMessage): boolean {
    return this.id.equals(other.id);
  }
}
