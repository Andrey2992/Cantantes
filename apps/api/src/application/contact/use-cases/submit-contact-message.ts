import { ContactMessage } from '../../../domain/contact/entities/ContactMessage.js';
import type { ContactMessageRepository } from '../../../domain/contact/repositories/ContactMessageRepository.js';
import type { EmailAddress } from '../../../domain/shared/value-objects/EmailAddress.js';
import type { LongText } from '../../../domain/shared/value-objects/LongText.js';
import type { ShortText } from '../../../domain/shared/value-objects/ShortText.js';
import type { IdGenerator } from '../../shared/ports/id-generator.js';

/**
 * EN: Validated input of the contact use case.
 *
 * The presentation layer builds these value objects (so raw HTTP input never
 * reaches the application layer, mirroring how `GetProject` receives an
 * already-validated `ProjectSlug`).
 *
 * ES: Entrada validada del caso de uso de contacto.
 *
 * La capa de presentación construye estos value objects (así la entrada HTTP cruda
 * nunca llega a la capa de aplicación, imitando cómo `GetProject` recibe un
 * `ProjectSlug` ya validado).
 */
export type SubmitContactMessageInput = {
  readonly name: ShortText;
  readonly email: EmailAddress;
  readonly message: LongText;
};

/**
 * EN: Use case — accept and persist a contact message.
 *
 * Execution flow:
 * 1. Request a fresh identity from the {@link IdGenerator} port.
 * 2. Build a validated {@link ContactMessage} aggregate with the submission
 *    instant.
 * 3. Persist it through the {@link ContactMessageRepository} port.
 *
 * It stores the message and does nothing else: no email is sent, because no email
 * provider is configured (AGENTS.md section 8; the response, therefore, only ever
 * confirms that the message was received and stored).
 *
 * ES: Caso de uso — aceptar y persistir un mensaje de contacto.
 *
 * Flujo de ejecución:
 * 1. Solicita una identidad nueva al puerto {@link IdGenerator}.
 * 2. Construye un agregado {@link ContactMessage} validado con el instante de
 *    envío.
 * 3. Lo persiste a través del puerto {@link ContactMessageRepository}.
 *
 * Almacena el mensaje y no hace nada más: no se envía ningún correo, porque no hay
 * proveedor de correo configurado (AGENTS.md sección 8; por eso la respuesta solo
 * confirma que el mensaje fue recibido y almacenado).
 */
export class SubmitContactMessage {
  constructor(
    private readonly messages: ContactMessageRepository,
    private readonly idGenerator: IdGenerator,
  ) {}

  /**
   * EN: Stores a validated contact message.
   * @param input Validated sender data, see {@link SubmitContactMessageInput}.
   * @returns The persisted aggregate, including its assigned identity and the
   * submission instant.
   * @throws {never} No application-specific error is expected; the input was
   * validated by the presentation layer before this call.
   *
   * ES: Almacena un mensaje de contacto validado.
   * @param input Datos del remitente ya validados, ver {@link SubmitContactMessageInput}.
   * @returns El agregado persistido, incluyendo su identidad asignada y el
   * instante de envío.
   * @throws {never} No se espera error específico de aplicación; la presentación
   * validó la entrada antes de esta llamada.
   */
  async execute(input: SubmitContactMessageInput): Promise<ContactMessage> {
    const message = ContactMessage.create({
      id: this.idGenerator.next(),
      name: input.name.value,
      email: input.email.value,
      message: input.message.value,
    });

    await this.messages.save(message);

    return message;
  }
}
