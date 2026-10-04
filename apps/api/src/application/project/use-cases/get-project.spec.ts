import { describe, expect, it } from 'vitest';
import { GetProject } from './get-project.js';
import { ProjectNotFoundError } from '../errors/project-not-found.error.js';
import { Project } from '../../../domain/project/entities/Project.js';
import { ProjectSlug } from '../../../domain/project/value-objects/ProjectSlug.js';
import { InMemoryProjectRepository } from '../../../../test/doubles/in-memory-project.repository.js';

const stored = Project.create({
  id: 'prj_01',
  slug: 'sade',
  title: 'Sade',
  theme: { from: '#1f140e', to: '#5a3c22', accent: '#c9a227' },
});

describe('GetProject', () => {
  it('returns the project matching the slug', async () => {
    const useCase = new GetProject(new InMemoryProjectRepository([stored]));

    const result = await useCase.execute(ProjectSlug.of('sade'));

    expect(result.equals(stored)).toBe(true);
  });

  it('raises ProjectNotFoundError for an unknown slug', async () => {
    const useCase = new GetProject(new InMemoryProjectRepository([stored]));

    await expect(
      useCase.execute(ProjectSlug.of('avicii')),
    ).rejects.toBeInstanceOf(ProjectNotFoundError);
  });
});
