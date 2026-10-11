import { toExperience } from './prisma-experience.repository.js';

/**
 * EN: The mapper is exported precisely so it can be tested without a database:
 * these tests prove that a row becomes a valid aggregate and that an invalid row
 * fails loudly (AGENTS.md sections 13 and 19).
 *
 * ES: El mapeador se exporta justo para poder probarlo sin base de datos: estas
 * pruebas demuestran que una fila se convierte en un agregado válido y que una
 * fila inválida falla de forma ruidosa (AGENTS.md secciones 13 y 19).
 */
type Row = Parameters<typeof toExperience>[0];

const row: Row = {
  id: 'exp_01',
  company: 'Acme',
  role: 'Backend Engineer',
  summary: 'Built services.',
  startDate: new Date('2021-01-01T00:00:00.000Z'),
  endDate: new Date('2022-06-01T00:00:00.000Z'),
};

describe('toExperience', () => {
  it('maps a row into a validated aggregate', () => {
    const experience = toExperience(row);

    expect(experience.id.value).toBe('exp_01');
    expect(experience.companyName.value).toBe('Acme');
    expect(experience.roleTitle.value).toBe('Backend Engineer');
    expect(experience.description?.value).toBe('Built services.');
    expect(experience.timeSpan.start.toISOString()).toBe(
      '2021-01-01T00:00:00.000Z',
    );
    expect(experience.timeSpan.end?.toISOString()).toBe(
      '2022-06-01T00:00:00.000Z',
    );
  });

  it('maps a null summary and null end date', () => {
    const experience = toExperience({ ...row, summary: null, endDate: null });

    expect(experience.description).toBeNull();
    expect(experience.timeSpan.isOngoing).toBe(true);
  });

  it('fails loudly when a stored row violates a domain invariant', () => {
    expect(() =>
      toExperience({ ...row, endDate: new Date('2020-01-01T00:00:00.000Z') }),
    ).toThrow();
  });
});
