import { DomainError } from '../../shared/errors/DomainError.js';
import { ContactMessage } from './ContactMessage.js';

const submittedAt = new Date('2026-03-01T12:00:00.000Z');

function create(
  overrides: Partial<Parameters<typeof ContactMessage.create>[0]> = {},
  now: Date = submittedAt,
) {
  return ContactMessage.create(
    {
      id: 'msg_01',
      name: 'Jane Doe',
      email: '  Jane@Example.COM ',
      message: 'Hello there.',
      ...overrides,
    },
    now,
  );
}

describe('ContactMessage.create', () => {
  it('normalizes the name and the email address', () => {
    const message = create();

    expect(message.name.value).toBe('Jane Doe');
    expect(message.email.value).toBe('jane@example.com');
    expect(message.message.value).toBe('Hello there.');
  });

  it('preserves the multi-line body', () => {
    const message = create({ message: 'line one\nline two' });

    expect(message.message.value).toBe('line one\nline two');
  });

  it('stamps the submission instant from the injected clock', () => {
    expect(create().submittedAt).toEqual(submittedAt);
  });

  it('rejects an invalid email address', () => {
    expect(() => create({ email: 'not-an-email' })).toThrow(DomainError);
  });

  it('rejects an empty name or message', () => {
    expect(() => create({ name: '   ' })).toThrow(DomainError);
    expect(() => create({ message: '   ' })).toThrow(DomainError);
  });

  it('rejects a message longer than the bound', () => {
    expect(() => create({ message: 'a'.repeat(4001) })).toThrow(DomainError);
  });

  it('is identity-based for equality', () => {
    expect(create().equals(create())).toBe(true);
    expect(create().equals(create({ id: 'msg_02' }))).toBe(false);
  });
});
