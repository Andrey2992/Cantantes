import { defineConfig } from 'vitest/config';

/**
 * EN: Vitest configuration for the frontend.
 *
 * The API integration layer is plain TypeScript (no DOM), so tests run in the
 * Node environment. Keeping DOM/component testing out of scope is deliberate:
 * the portfolio screens do not exist yet, and `AGENTS.md` forbids inventing them.
 *
 * ES: Configuración de Vitest para el frontend.
 *
 * La capa de integración de API es TypeScript puro (sin DOM), así que las pruebas
 * corren en el entorno Node. Dejar fuera las pruebas de DOM/componentes es
 * deliberado: las pantallas del portafolio aún no existen y `AGENTS.md` prohíbe
 * inventarlas.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
  },
});
