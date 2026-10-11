import { describe, expect, it } from 'vitest';
import { SubmitContactMessage } from './submit-contact-message.js';
import { EmailAddress } from '../../../domain/shared/value-objects/EmailAddress.js';
import { LongText } from '../../../domain/shared/value-objects/LongText.js';
import { ShortText } from '../../../domain/shared/value-objects/ShortText.js';
import { FakeIdGenerator } from '../../../../test/doubles/fake-id-generator.js';
import { InMemoryContactMessageRepository } from '../../../../test/doubles/in-memory-contact-message.repository.js';

function input() {
  return {
    name: ShortText.of('Jane Doe', { field: 'Contact name', maxLength: 120 }),
    email: EmailAddress.of('jane@example.com'),
    message: LongText.of('Hello there.', {
      field: 'Contact message',
      maxLength: 4000,
    }),
  };
}

describe('SubmitContactMessage', () => {
  it('stores a validated message and returns the persisted aggregate', async () => {
    const repository = new InMemoryContactMessageRepository();
    const useCase = new SubmitContactMessage(repository, new FakeIdGenerator());

    const message = await useCase.execute(input());

    expect(repository.stored).toHaveLength(1);
    expect(repository.stored[0]).toBe(message);
    expect(message.id.value).toBe('seq_1');
    expect(message.email.value).toBe('jane@example.com');
    expect(message.submittedAt).toBeInstanceOf(Date);
  });

  it('assigns a distinct identity per message', async () => {
    const repository = new InMemoryContactMessageRepository();
    const useCase = new SubmitContactMessage(repository, new FakeIdGenerator());

    await useCase.execute(input());
    await useCase.execute(input());

    expect(repository.stored.map((each) => each.id.value)).toEqual([
      'seq_1',
      'seq_2',
    ]);
  });
});
