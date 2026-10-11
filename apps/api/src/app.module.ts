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

import { GetExperience } from './application/experience/use-cases/get-experience.js';
import { EXPERIENCE_REPOSITORY } from './application/experience/experience-repository.token.js';
import type { ExperienceRepository } from './domain/experience/repositories/ExperienceRepository.js';
import { PrismaExperienceRepository } from './infrastructure/repositories/prisma-experience.repository.js';
import { ExperiencesController } from './presentation/experience/experiences.controller.js';

import { GetSkills } from './application/skill/use-cases/get-skills.js';
import { SKILL_REPOSITORY } from './application/skill/skill-repository.token.js';
import type { SkillRepository } from './domain/skill/repositories/SkillRepository.js';
import { PrismaSkillRepository } from './infrastructure/repositories/prisma-skill.repository.js';
import { SkillsController } from './presentation/skill/skills.controller.js';

import { SubmitContactMessage } from './application/contact/use-cases/submit-contact-message.js';
import { CONTACT_MESSAGE_REPOSITORY } from './application/contact/contact-message-repository.token.js';
import type { ContactMessageRepository } from './domain/contact/repositories/ContactMessageRepository.js';
import { CryptoIdGenerator } from './infrastructure/id-generation/crypto-id-generator.js';
import { PrismaContactMessageRepository } from './infrastructure/repositories/prisma-contact-message.repository.js';
import { ID_GENERATOR } from './application/shared/ports/id-generator.js';
import { ContactController } from './presentation/contact/contact.controller.js';

import { CheckHealth } from './application/health/use-cases/check-health.js';
import {
  HEALTH_PROBE,
  type HealthProbe,
} from './application/health/ports/health-probe.js';
import { PrismaHealthProbe } from './infrastructure/health/prisma-health-probe.js';
import { HealthController } from './presentation/health/health.controller.js';
import type { IdGenerator } from './application/shared/ports/id-generator.js';

/**
 * EN: Composition root.
 *
 * This is the only module that is allowed to know every layer at once: it binds
 * each domain port to its Prisma implementation, constructs the framework-free
 * use cases through explicit factories, and exposes the presentation layer.
 * Nothing below this file imports across layers (AGENTS.md sections 9, 10 and 11).
 *
 * Providers are grouped per bounded context so the file stays readable; each
 * group is intentionally small because every context is thin.
 *
 * ES: Raíz de composición.
 *
 * Es el único módulo al que se le permite conocer todas las capas a la vez: enlaza
 * cada puerto de dominio con su implementación Prisma, construye los casos de uso
 * libres de framework mediante fábricas explícitas y expone la capa de
 * presentación. Nada por debajo de este archivo importa entre capas (AGENTS.md
 * secciones 9, 10 y 11).
 *
 * Los proveedores se agrupan por contexto delimitado para que el archivo siga
 * siendo legible; cada grupo es deliberadamente pequeño porque cada contexto es
 * delgado.
 */

/**
 * EN: Use cases receive collaborators through explicit factories instead of
 * constructor decorators, which keeps the application layer free of NestJS.
 *
 * ES: Los casos de uso reciben colaboradores mediante fábricas explícitas en vez
 * de decoradores de constructor, lo que mantiene la capa de aplicación libre de
 * NestJS.
 */
const useCaseProviders: Provider[] = [
  // --- Project context ---
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

  // --- Experience context ---
  {
    provide: EXPERIENCE_REPOSITORY,
    useClass: PrismaExperienceRepository,
  },
  {
    provide: GetExperience,
    useFactory: (experiences: ExperienceRepository) =>
      new GetExperience(experiences),
    inject: [EXPERIENCE_REPOSITORY],
  },

  // --- Skill context ---
  {
    provide: SKILL_REPOSITORY,
    useClass: PrismaSkillRepository,
  },
  {
    provide: GetSkills,
    useFactory: (skills: SkillRepository) => new GetSkills(skills),
    inject: [SKILL_REPOSITORY],
  },

  // --- Contact context ---
  {
    provide: CONTACT_MESSAGE_REPOSITORY,
    useClass: PrismaContactMessageRepository,
  },
  {
    provide: ID_GENERATOR,
    useClass: CryptoIdGenerator,
  },
  {
    provide: SubmitContactMessage,
    useFactory: (
      messages: ContactMessageRepository,
      idGenerator: IdGenerator,
    ) => new SubmitContactMessage(messages, idGenerator),
    inject: [CONTACT_MESSAGE_REPOSITORY, ID_GENERATOR],
  },

  // --- Health context ---
  {
    provide: HEALTH_PROBE,
    useClass: PrismaHealthProbe,
  },
  {
    provide: CheckHealth,
    useFactory: (probe: HealthProbe) => new CheckHealth(probe),
    inject: [HEALTH_PROBE],
  },
];

@Module({
  imports: [ConfigModule.forRoot(apiConfigModuleOptions), DatabaseModule],
  controllers: [
    ProjectsController,
    ExperiencesController,
    SkillsController,
    ContactController,
    HealthController,
  ],
  providers: [
    ...useCaseProviders,
    // Registered as a provider so the filter also applies to the test app.
    { provide: 'APP_FILTER', useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
