import { Project } from './Project.js';
import { DomainError } from '../errors/DomainError.js';
import { ProjectTitle } from '../value-objects/ProjectTitle.js';
import { ProjectTheme } from '../value-objects/ProjectTheme.js';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const props = {
  id: 'prj_01',
  title: 'Sade',
  theme: { from: '#1f140e', to: '#5a3c22', accent: '#c9a227' },
};

describe('Project.create', () => {
  it('derives the slug from the title when none is provided', () => {
    const project = Project.create({ ...props, title: 'The Neighbourhood' });

    expect(project.slug.value).toBe('the-neighbourhood');
  });

  it('honours an explicit slug', () => {
    const project = Project.create({ ...props, slug: 'sade-custom' });

    expect(project.slug.value).toBe('sade-custom');
  });

  it('rejects an explicit slug that is not canonical', () => {
    expect(() => Project.create({ ...props, slug: 'Sade Custom' })).toThrow(
      DomainError,
    );
  });

  it('normalizes the stored title', () => {
    expect(
      Project.create({ ...props, title: '  Sade   Adu  ' }).title.value,
    ).toBe('Sade Adu');
  });

  it('stamps both timestamps with the same instant', () => {
    const project = Project.create(props, createdAt);

    expect(project.createdAt).toEqual(createdAt);
    expect(project.updatedAt).toEqual(createdAt);
  });

  it('rejects invalid primitives instead of storing them', () => {
    expect(() => Project.create({ ...props, id: '  ' })).toThrow(DomainError);
    expect(() => Project.create({ ...props, title: '' })).toThrow(DomainError);
    expect(() =>
      Project.create({
        ...props,
        theme: { from: '#000', to: '#fff', accent: '#fff' },
      }),
    ).toThrow(DomainError);
  });
});

describe('Project.restore', () => {
  it('rehydrates a stored project with its original timestamps', () => {
    const project = Project.restore({
      ...props,
      slug: 'sade',
      createdAt,
      updatedAt,
    });

    expect(project.id.value).toBe('prj_01');
    expect(project.title.value).toBe('Sade');
    expect(project.slug.value).toBe('sade');
    expect(project.theme.from).toBe('#1f140e');
    expect(project.createdAt).toEqual(createdAt);
    expect(project.updatedAt).toEqual(updatedAt);
  });

  it('applies the same invariants to stored data', () => {
    expect(() =>
      Project.restore({ ...props, slug: 'Sade', createdAt, updatedAt }),
    ).toThrow(DomainError);
  });

  it('rejects a stored row updated before it was created', () => {
    expect(() =>
      Project.restore({
        ...props,
        slug: 'sade',
        createdAt,
        updatedAt: new Date('2025-12-31T00:00:00.000Z'),
      }),
    ).toThrow(DomainError);
  });
});

describe('Project.rename', () => {
  it('changes the title and keeps the slug stable by default', () => {
    const project = Project.create(props, createdAt);

    project.rename(ProjectTitle.of('Sade Adu'));

    expect(project.title.value).toBe('Sade Adu');
    expect(project.slug.value).toBe('sade');
  });

  it('re-derives the slug only when explicitly asked', () => {
    const project = Project.create(props, createdAt);

    project.rename(ProjectTitle.of('Sade Adu'), { reslug: true });

    expect(project.slug.value).toBe('sade-adu');
  });

  it('is a no-op for an unchanged title', () => {
    const project = Project.create(props, createdAt);

    project.rename(ProjectTitle.of('  Sade  '));

    expect(project.updatedAt).toEqual(createdAt);
  });

  it('treats a case-only change as a real rename', () => {
    const project = Project.create(props, createdAt);

    project.rename(ProjectTitle.of('SADE'));

    expect(project.title.value).toBe('SADE');
    expect(project.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
  });
});

describe('Project.changeTheme', () => {
  const next = ProjectTheme.of({
    from: '#09203f',
    to: '#00d2ff',
    accent: '#00d2ff',
  });

  it('replaces the visual state', () => {
    const project = Project.create(props, createdAt);

    project.changeTheme(next);

    expect(project.theme.equals(next)).toBe(true);
  });

  it('is a no-op for an equivalent theme', () => {
    const project = Project.create(props, createdAt);

    project.changeTheme(
      ProjectTheme.of({ from: '#1F140E', to: '#5A3C22', accent: '#C9A227' }),
    );

    expect(project.updatedAt).toEqual(createdAt);
  });
});

describe('Project equality', () => {
  it('is identity-based', () => {
    const first = Project.create(props, createdAt);
    const second = Project.create(props, createdAt);

    expect(first.equals(second)).toBe(true);
    expect(
      first.equals(Project.create({ ...props, id: 'prj_02' }, createdAt)),
    ).toBe(false);
  });
});
