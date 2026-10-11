import { DomainError } from '../../shared/errors/DomainError.js';
import { Skill } from './Skill.js';

function create(overrides: Partial<Parameters<typeof Skill.create>[0]> = {}) {
  return Skill.create({
    id: 'skl_01',
    name: 'TypeScript',
    category: 'Languages',
    ...overrides,
  });
}

describe('Skill.create', () => {
  it('normalizes the name and category', () => {
    const skill = create({
      name: '  Type   Script ',
      category: '  Languages ',
    });

    expect(skill.name.value).toBe('Type Script');
    expect(skill.category?.value).toBe('Languages');
  });

  it('stores an absent category as null', () => {
    expect(create({ category: null }).category).toBeNull();
    expect(create({ category: '   ' }).category).toBeNull();
  });

  it('rejects invalid primitives instead of storing them', () => {
    expect(() => create({ id: '  ' })).toThrow(DomainError);
    expect(() => create({ name: '' })).toThrow(DomainError);
    expect(() => create({ name: 'a'.repeat(81) })).toThrow(DomainError);
  });

  it('is identity-based for equality', () => {
    expect(create().equals(create())).toBe(true);
    expect(create().equals(create({ id: 'skl_02' }))).toBe(false);
  });
});
