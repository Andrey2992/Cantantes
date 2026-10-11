import { describe, expect, it } from 'vitest';
import { GetExperience } from './get-experience.js';
import { Experience } from '../../../domain/experience/entities/Experience.js';
import { InMemoryExperienceRepository } from '../../../../test/doubles/in-memory-experience.repository.js';

const period = {
  start: new Date('2021-01-01T00:00:00.000Z'),
  end: null,
};

function experience(id: string): Experience {
  return Experience.create({
    id,
    company: 'Acme',
    role: 'Engineer',
    period,
  });
}

describe('GetExperience', () => {
  it('returns every record from the port', async () => {
    const repository = new InMemoryExperienceRepository([
      experience('exp_01'),
      experience('exp_02'),
    ]);

    const result = await new GetExperience(repository).execute();

    expect(result.map((each) => each.id.value)).toEqual(['exp_01', 'exp_02']);
  });

  it('returns an empty list when there is nothing stored', async () => {
    const result = await new GetExperience(
      new InMemoryExperienceRepository(),
    ).execute();

    expect(result).toEqual([]);
  });
});
