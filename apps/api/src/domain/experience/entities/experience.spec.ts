import { DomainError } from '../../shared/errors/DomainError.js';
import { Experience } from './Experience.js';

const start = new Date('2021-01-01T00:00:00.000Z');
const end = new Date('2022-06-01T00:00:00.000Z');

function create(
  overrides: Partial<Parameters<typeof Experience.create>[0]> = {},
) {
  return Experience.create({
    id: 'exp_01',
    company: 'Acme',
    role: 'Backend Engineer',
    summary: 'Built services.',
    period: { start, end },
    ...overrides,
  });
}

describe('Experience.create', () => {
  it('normalizes short fields', () => {
    const experience = create({ company: '  Acme   Corp ', role: '  Dev  ' });

    expect(experience.companyName.value).toBe('Acme Corp');
    expect(experience.roleTitle.value).toBe('Dev');
  });

  it('keeps an optional summary', () => {
    expect(create().description?.value).toBe('Built services.');
  });

  it('stores an absent summary as null', () => {
    expect(create({ summary: null }).description).toBeNull();
    expect(create({ summary: '   ' }).description).toBeNull();
  });

  it('exposes an ongoing period when the end is null', () => {
    expect(create({ period: { start, end: null } }).timeSpan.isOngoing).toBe(
      true,
    );
  });

  it('rejects invalid primitives instead of storing them', () => {
    expect(() => create({ id: '  ' })).toThrow(DomainError);
    expect(() => create({ company: '' })).toThrow(DomainError);
    expect(() => create({ role: '' })).toThrow(DomainError);
    expect(() =>
      create({ period: { start, end: new Date('2020-01-01T00:00:00.000Z') } }),
    ).toThrow(DomainError);
  });

  it('returns a detached aggregate on every call', () => {
    const experience = create();

    expect(experience.equals(create())).toBe(true);
    expect(experience.equals(create({ id: 'exp_02' }))).toBe(false);
  });
});
