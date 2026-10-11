import type { ExperienceListResponse } from '@cantantes/types';
import { Controller, Get } from '@nestjs/common';
import { GetExperience } from '../../application/experience/use-cases/get-experience.js';
import { toExperienceResponse } from './dto/experience-response.dto.js';

/**
 * EN: Read-only HTTP surface of the Experience domain (`GET /api/v1/experience`).
 *
 * The controller receives the request, delegates to the use case and maps the
 * result to the shared contract. It contains no business rules and no data
 * access (AGENTS.md section 11).
 *
 * There is intentionally no write endpoint: experience records are authored
 * through migrations, never through the API (AGENTS.md section 23).
 *
 * ES: Superficie HTTP de solo lectura del dominio Experience
 * (`GET /api/v1/experience`).
 *
 * El controlador recibe la petición, delega en el caso de uso y mapea el resultado
 * al contrato compartido. No contiene reglas de negocio ni acceso a datos
 * (AGENTS.md sección 11).
 *
 * A propósito no hay endpoint de escritura: los registros de experiencia se
 * redactan mediante migraciones, nunca mediante la API (AGENTS.md sección 23).
 */
@Controller('experience')
export class ExperiencesController {
  constructor(private readonly getExperience: GetExperience) {}

  /**
   * EN: Returns the full experience roster. An empty table answers an empty
   * array, never an error.
   * @returns The shared contract {@link ExperienceListResponse}.
   *
   * ES: Devuelve el listado completo de experiencia. Una tabla vacía responde un
   * arreglo vacío, nunca un error.
   * @returns El contrato compartido {@link ExperienceListResponse}.
   */
  @Get()
  async list(): Promise<ExperienceListResponse> {
    const experiences = await this.getExperience.execute();

    return experiences.map(toExperienceResponse);
  }
}
