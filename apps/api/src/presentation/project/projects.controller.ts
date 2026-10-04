import type { ProjectListResponse, ProjectResponse } from '@cantantes/types';
import { Controller, Get, Param } from '@nestjs/common';
import { GetProject } from '../../application/project/use-cases/get-project.js';
import { GetProjects } from '../../application/project/use-cases/get-projects.js';
import type { ProjectSlug } from '../../domain/project/value-objects/ProjectSlug.js';
import { toProjectResponse } from './dto/project-response.dto.js';
import { ParseProjectSlugPipe } from './pipes/parse-project-slug.pipe.js';

/**
 * Read-only HTTP surface of the Project domain.
 *
 * The controller receives the request, delegates to one use case and maps the
 * result to the shared contract. It contains no branching on business state, no
 * data access and no knowledge of Prisma (AGENTS.md section 11).
 *
 * There are intentionally no write endpoints and no authentication yet: the
 * portfolio content is authored through migrations, not through the API.
 */
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly getProjects: GetProjects,
    private readonly getProject: GetProject,
  ) {}

  @Get()
  async list(): Promise<ProjectListResponse> {
    const projects = await this.getProjects.execute();

    return projects.map(toProjectResponse);
  }

  @Get(':slug')
  async detail(
    @Param('slug', ParseProjectSlugPipe) slug: ProjectSlug,
  ): Promise<ProjectResponse> {
    const project = await this.getProject.execute(slug);

    return toProjectResponse(project);
  }
}
