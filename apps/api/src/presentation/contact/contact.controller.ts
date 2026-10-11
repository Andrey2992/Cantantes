import type { ContactReceivedResponse } from '@cantantes/types';
import { Body, Controller, Post } from '@nestjs/common';
import type { SubmitContactMessageInput } from '../../application/contact/use-cases/submit-contact-message.js';
import { SubmitContactMessage } from '../../application/contact/use-cases/submit-contact-message.js';
import { ParseContactMessagePipe } from './pipes/parse-contact-message.pipe.js';

/**
 * EN: HTTP surface of the Contact domain (`POST /api/v1/contact`).
 *
 * Thin controller: it receives the validated input from the pipe, delegates to
 * the use case and answers a fixed acknowledgment. It holds no business rule and
 * performs no data access (AGENTS.md section 11). The pipe does the validation,
 * the use case persists the message, and the response only ever says it was
 * received — no email is claimed to have been sent.
 *
 * ES: Superficie HTTP del dominio Contact (`POST /api/v1/contact`).
 *
 * Controlador delgado: recibe la entrada validada del pipe, delega en el caso de
 * uso y responde un acuse fijo. No guarda reglas de negocio ni accede a datos
 * (AGENTS.md sección 11). El pipe hace la validación, el caso de uso persiste el
 * mensaje y la respuesta solo dice que fue recibido — nunca se afirma que se haya
 * enviado un correo.
 */
@Controller('contact')
export class ContactController {
  constructor(private readonly submitContactMessage: SubmitContactMessage) {}

  /**
   * EN: Accepts and stores a contact message.
   * @param input Validated sender data produced by {@link ParseContactMessagePipe}.
   * @returns A fixed acknowledgment. `201` is the HTTP default for `POST`.
   *
   * ES: Acepta y almacena un mensaje de contacto.
   * @param input Datos validados del remitente producidos por {@link ParseContactMessagePipe}.
   * @returns Un acuse fijo. `201` es el código HTTP por defecto de `POST`.
   */
  @Post()
  async submit(
    @Body(ParseContactMessagePipe) input: SubmitContactMessageInput,
  ): Promise<ContactReceivedResponse> {
    await this.submitContactMessage.execute(input);

    return { status: 'received' };
  }
}
