import type { ContactMessageRepository } from '../../domain/contact/repositories/ContactMessageRepository.js';

/**
 * EN: Injection token for the ContactMessage persistence port, following the same
 * convention as `PROJECT_REPOSITORY` (AGENTS.md sections 8 and 10).
 *
 * ES: Token de inyección del puerto de persistencia de ContactMessage, siguiendo
 * la misma convención que `PROJECT_REPOSITORY` (AGENTS.md secciones 8 y 10).
 */
export const CONTACT_MESSAGE_REPOSITORY = Symbol('CONTACT_MESSAGE_REPOSITORY');

export type ContactMessageRepositoryPort = ContactMessageRepository;
