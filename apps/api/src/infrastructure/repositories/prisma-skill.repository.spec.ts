import { toSkill } from './prisma-skill.repository.js';

/**
 * EN: Unit tests for the exported row-to-aggregate mapper (AGENTS.md sections 13
 * and 19).
 *
 * ES: Pruebas unitarias del mapeador fila-a-agregado exportado (AGENTS.md
 * secciones 13 y 19).
 */
type Row = Parameters<typeof toSkill>[0];

const row: Row = {
  id: 'skl_01',
  name: 'TypeScript',
  category: 'Languages',
};

describe('toSkill', () => {
  it('maps a row into a validated aggregate', () => {
    const skill = toSkill(row);

    expect(skill.id.value).toBe('skl_01');
    expect(skill.name.value).toBe('TypeScript');
    expect(skill.category?.value).toBe('Languages');
  });

  it('maps a null category', () => {
    expect(toSkill({ ...row, category: null }).category).toBeNull();
  });

  it('fails loudly when a stored row violates a domain invariant', () => {
    expect(() => toSkill({ ...row, name: '' })).toThrow();
  });
});
