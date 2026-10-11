import type { SkillListResponse } from '@cantantes/types';
import { Controller, Get } from '@nestjs/common';
import { GetSkills } from '../../application/skill/use-cases/get-skills.js';
import { toSkillResponse } from './dto/skill-response.dto.js';

/**
 * EN: Read-only HTTP surface of the Skill domain (`GET /api/v1/skills`).
 *
 * Thin controller: receives the request, delegates to the use case and maps the
 * result (AGENTS.md section 11). No write endpoint: skills are authored through
 * migrations (AGENTS.md section 23).
 *
 * ES: Superficie HTTP de solo lectura del dominio Skill (`GET /api/v1/skills`).
 *
 * Controlador delgado: recibe la petición, delega en el caso de uso y mapea el
 * resultado (AGENTS.md sección 11). Sin endpoint de escritura: las habilidades se
 * redactan mediante migraciones (AGENTS.md sección 23).
 */
@Controller('skills')
export class SkillsController {
  constructor(private readonly getSkills: GetSkills) {}

  /**
   * EN: Returns every skill. An empty table answers an empty array.
   * @returns The shared contract {@link SkillListResponse}.
   *
   * ES: Devuelve todas las habilidades. Una tabla vacía responde un arreglo vacío.
   * @returns El contrato compartido {@link SkillListResponse}.
   */
  @Get()
  async list(): Promise<SkillListResponse> {
    const skills = await this.getSkills.execute();

    return skills.map(toSkillResponse);
  }
}
