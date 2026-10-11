import { Injectable } from '@nestjs/common';
import { ContactMessage } from '../../domain/contact/entities/ContactMessage.js';
import type { ContactMessageRepository } from '../../domain/contact/repositories/ContactMessageRepository.js';
import { PrismaService } from '../database/prisma.service.js';

/**
 * EN: Prisma adapter for the domain `ContactMessageRepository` port.
 *
 * The aggregate carries every value already normalized and validated, so this
 * class does nothing but write one row. It uses `create` (not `upsert`) because
 * the use case generates a fresh identity per message: there is never an existing
 * row to update, and trying to would mask a real duplicate (AGENTS.md section 13).
 *
 * ES: Adaptador Prisma del puerto de dominio `ContactMessageRepository`.
 *
 * El agregado ya trae todos los valores normalizados y validados, así que esta
 * clase solo escribe una fila. Usa `create` (no `upsert`) porque el caso de uso
 * genera una identidad nueva por mensaje: nunca existe una fila previa que
 * actualizar, e intentarlo enmascararía un duplicado real (AGENTS.md sección 13).
 */
@Injectable()
export class PrismaContactMessageRepository implements ContactMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * EN: Persists a validated contact message as a single row.
   * @param message The aggregate to store.
   * @returns Resolves once the row is written.
   *
   * ES: Persiste un mensaje de contacto validado como una sola fila.
   * @param message El agregado a almacenar.
   * @returns Resuelve una vez escrita la fila.
   */
  async save(message: ContactMessage): Promise<void> {
    await this.prisma.contactMessage.create({
      data: {
        id: message.id.value,
        name: message.name.value,
        email: message.email.value,
        message: message.message.value,
        createdAt: message.submittedAt,
      },
    });
  }
}
