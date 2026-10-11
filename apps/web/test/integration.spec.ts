import { describe, expect, it } from 'vitest';
import {
  getHealth,
  getProjectBySlug,
  listExperience,
  listProjects,
  listSkills,
} from '../lib/api';

/**
 * EN: Opt-in integration test against a **live** NestJS API.
 *
 * It uses the exact client the frontend uses, which is the point: it proves
 * frontend-to-backend connectivity and the real response contracts, not a mock.
 * It is skipped unless `API_INTEGRATION_BASE_URL` is set, so the normal unit run
 * never needs a server or a database.
 *
 * Run it with the API (and PostgreSQL) up:
 *
 * ```bash
 * API_INTEGRATION_BASE_URL=http://localhost:3001 npm run test --workspace @cantantes/web
 * ```
 *
 * ES: Prueba de integración opcional contra una API NestJS **en vivo**.
 *
 * Usa exactamente el mismo cliente que usa el frontend, que es el punto: demuestra
 * la conectividad frontend-backend y los contratos de respuesta reales, no un
 * mock. Se omite salvo que `API_INTEGRATION_BASE_URL` esté definida, así que la
 * corrida unitaria normal nunca necesita servidor ni base de datos.
 *
 * Ejecútala con la API (y PostgreSQL) arriba:
 *
 * ```bash
 * API_INTEGRATION_BASE_URL=http://localhost:3001 npm run test --workspace @cantantes/web
 * ```
 */

const baseUrl = process.env.API_INTEGRATION_BASE_URL;

describe.skipIf(baseUrl === undefined)('live API integration', () => {
  const options = { baseUrl };

  it('reports health with the database up', async () => {
    const health = await getHealth(options);

    expect(health.status).toBe('ok');
    expect(health.database).toBe('up');
  });

  it('returns a well-formed project list', async () => {
    const projects = await listProjects(options);

    expect(Array.isArray(projects)).toBe(true);
  });

  it('returns null for an unknown project slug', async () => {
    const project = await getProjectBySlug('__does_not_exist__', options);

    expect(project).toBeNull();
  });

  it('returns a well-formed experience list', async () => {
    const experiences = await listExperience(options);

    expect(Array.isArray(experiences)).toBe(true);
  });

  it('returns a well-formed skill list', async () => {
    const skills = await listSkills(options);

    expect(Array.isArray(skills)).toBe(true);
  });
});
