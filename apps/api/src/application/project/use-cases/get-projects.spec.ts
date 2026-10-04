import { describe, expect, it } from 'vitest';
import { GetProjects } from './get-projects.js';
import { Project } from '../../../domain/project/entities/Project.js';
import { InMemoryProjectRepository } from '../../../../test/doubles/in-memory-project.repository.js';

function project(id: string, slug: string): Project {
  return Project.create({
    id,
    slug,
    title: slug,
    theme: { from: '#1f140e', to: '#5a3c22', accent: '#c9a227' },
  });
}

describe('GetProjects', () => {
  it('returns every project from the port', async () => {
    const repository = new InMemoryProjectRepository([
      project('prj_01', 'sade'),
      project('prj_02', 'avicii'),
    ]);

    const result = await new GetProjects(repository).execute();

    expect(result.map((each) => each.slug.value)).toEqual(['sade', 'avicii']);
  });

  it('returns an empty list when there is nothing stored', async () => {
    const result = await new GetProjects(
      new InMemoryProjectRepository(),
    ).execute();

    expect(result).toEqual([]);
  });
});
