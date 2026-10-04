import { Module, type Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GetProject } from './application/project/use-cases/get-project.js';
import { GetProjects } from './application/project/use-cases/get-projects.js';
import { PROJECT_REPOSITORY } from './application/project/project-repository.token.js';
import type { ProjectRepository } from './domain/project/repositories/ProjectRepository.js';
import { apiConfigModuleOptions } from './infrastructure/config/api-config.js';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository.js';
import { AllExceptionsFilter } from './presentation/filters/all-exceptions.filter.js';
import { ProjectsController } from './presentation/project/projects.controller.js';

/**
 * Composition root.
 *
 * This is the only module that is allowed to know every layer at once: it binds
 * the domain port to its Prisma implementation, constructs the framework-free
 * use cases, and exposes the presentation layer. Nothing below this file
 * imports across layers (AGENTS.md sections 9, 10 and 11).
 */

/**
 * Use cases receive their collaborator through explicit factories instead of
 * constructor decorators, which keeps the application layer free of NestJS.
 */
const useCaseProviders: Provider[] = [
  {
    provide: PROJECT_REPOSITORY,
    useClass: PrismaProjectRepository,
  },
  {
    provide: GetProjects,
    useFactory: (projects: ProjectRepository) => new GetProjects(projects),
    inject: [PROJECT_REPOSITORY],
  },
  {
    provide: GetProject,
    useFactory: (projects: ProjectRepository) => new GetProject(projects),
    inject: [PROJECT_REPOSITORY],
  },
];

@Module({
  imports: [ConfigModule.forRoot(apiConfigModuleOptions), DatabaseModule],
  controllers: [ProjectsController],
  providers: [
    ...useCaseProviders,
    // Registered as a provider so the filter also applies to the test app.
    { provide: 'APP_FILTER', useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
