import { describe, expect, it } from 'vitest';
import { GetSkills } from './get-skills.js';
import { Skill } from '../../../domain/skill/entities/Skill.js';
import { InMemorySkillRepository } from '../../../../test/doubles/in-memory-skill.repository.js';

function skill(id: string, name: string): Skill {
  return Skill.create({ id, name, category: 'Languages' });
}

describe('GetSkills', () => {
  it('returns every skill from the port', async () => {
    const repository = new InMemorySkillRepository([
      skill('skl_01', 'TypeScript'),
      skill('skl_02', 'PostgreSQL'),
    ]);

    const result = await new GetSkills(repository).execute();

    expect(result.map((each) => each.name.value)).toEqual([
      'TypeScript',
      'PostgreSQL',
    ]);
  });

  it('returns an empty list when there is nothing stored', async () => {
    const result = await new GetSkills(new InMemorySkillRepository()).execute();

    expect(result).toEqual([]);
  });
});
