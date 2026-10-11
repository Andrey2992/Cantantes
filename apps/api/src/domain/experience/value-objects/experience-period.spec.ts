import { DomainError } from '../../shared/errors/DomainError.js';
import { ExperiencePeriod } from './ExperiencePeriod.js';

const start = new Date('2021-01-01T00:00:00.000Z');
const end = new Date('2022-06-01T00:00:00.000Z');

describe('ExperiencePeriod', () => {
  it('accepts an ongoing period when the end is null', () => {
    const period = ExperiencePeriod.of({ start, end: null });

    expect(period.isOngoing).toBe(true);
    expect(period.end).toBeNull();
  });

  it('accepts a closed period with end after start', () => {
    const period = ExperiencePeriod.of({ start, end });

    expect(period.isOngoing).toBe(false);
    expect(period.end?.toISOString()).toBe(end.toISOString());
  });

  it('accepts a same-instant start and end', () => {
    expect(() => ExperiencePeriod.of({ start, end: start })).not.toThrow();
  });

  it('rejects an end earlier than the start', () => {
    expect(() =>
      ExperiencePeriod.of({ start, end: new Date('2020-01-01T00:00:00.000Z') }),
    ).toThrow(DomainError);
  });

  it('rejects an invalid Date', () => {
    expect(() =>
      ExperiencePeriod.of({ start: new Date('nonsense'), end: null }),
    ).toThrow(DomainError);
  });

  it('hands back defensive copies so callers cannot mutate it', () => {
    const source = new Date(start.getTime());
    const period = ExperiencePeriod.of({ start: source, end: null });

    source.setUTCFullYear(1999);
    period.start.setUTCFullYear(1998);

    expect(period.start.toISOString()).toBe(start.toISOString());
  });

  it('compares by value', () => {
    const a = ExperiencePeriod.of({ start, end });
    const b = ExperiencePeriod.of({ start, end });
    const c = ExperiencePeriod.of({ start, end: null });

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
