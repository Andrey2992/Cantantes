import type { ProjectListResponse, ProjectResponse } from '@cantantes/types';
import { Controller, Get, Param } from '@nestjs/common';
import { GetProject } from '../../application/project/use-cases/get-project.js';
import { GetProjects } from '../../application/project/use-cases/get-projects.js';
import type { ProjectSlug } from '../../domain/project/value-objects/ProjectSlug.js';
import { toProjectResponse } from './dto/project-response.dto.js';
import { ParseProjectSlugPipe } from './pipes/parse-project-slug.pipe.js';

/**
 * EN: Read-only HTTP surface of the Project domain
 * (`GET /api/v1/projects`, `GET /api/v1/projects/:slug`).
 *
 * The controller receives the request, delegates to one use case and maps the
 * result to the shared contract. It contains no branching on business state, no
 * data access and no knowledge of Prisma (AGENTS.md section 11).
 *
 * There are intentionally no write endpoints and no authentication yet: the
 * portfolio content is authored through migrations, not through the API.
 *
 * ES: Superficie HTTP de solo lectura del dominio Project
 * (`GET /api/v1/projects`, `GET /api/v1/projects/:slug`).
 *
 * El controlador recibe la petición, delega en un caso de uso y mapea el
 * resultado al contrato compartido. No contiene ramificaciones sobre estado de
 * negocio, ni acceso a datos, ni conocimiento de Prisma (AGENTS.md sección 11).
 *
 * A propósito no hay endpoints de escritura ni autenticación aún: el contenido del
 * portafolio se redacta mediante migraciones, no a través de la API.
 */
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly getProjects: GetProjects,
    private readonly getProject: GetProject,
  ) {}

  /**
   * EN: Lists every project.
   * @returns The shared contract {@link ProjectListResponse}. An empty table
   * answers an empty array.
   *
   * ES: Lista todos los proyectos.
   * @returns El contrato compartido {@link ProjectListResponse}. Una tabla vacía
   * responde un arreglo vacío.
   */
  @Get()
  async list(): Promise<ProjectListResponse> {
    const projects = await this.getProjects.execute();

    return projects.map(toProjectResponse);
  }

  /**
   * EN: Returns one project by slug.
   * @param slug Route parameter validated by {@link ParseProjectSlugPipe} into a
   * domain value object.
   * @returns The shared contract {@link ProjectResponse}.
   * @throws {BadRequestException} If the slug is not canonical (400).
   * @throws {ProjectNotFoundError} If no project matches (mapped to 404).
   *
   * ES: Devuelve un proyecto por slug.
   * @param slug Parámetro de ruta validado por {@link ParseProjectSlugPipe} a un
   * value object de dominio.
   * @returns El contrato compartido {@link ProjectResponse}.
   * @throws {BadRequestException} Si el slug no es canónico (400).
   * @throws {ProjectNotFoundError} Si ningún proyecto coincide (mapeado a 404).
   */
  @Get(':slug')
  async detail(
    @Param('slug', ParseProjectSlugPipe) slug: ProjectSlug,
  ): Promise<ProjectResponse> {
    const project = await this.getProject.execute(slug);

    return toProjectResponse(project);
  }
}
