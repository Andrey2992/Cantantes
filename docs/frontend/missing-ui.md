# Missing UI / Interfaz pendiente

> EN: Inventory of the portfolio screens and forms that do **not** exist yet, and
> how each one will consume the API integration layer. This file exists because
> `AGENTS.md` §4 asks to document missing UI instead of building an unrelated
> generic layout.
>
> ES: Inventario de las pantallas y formularios del portafolio que **aún no**
> existen, y cómo cada uno consumirá la capa de integración de API. Este archivo
> existe porque `AGENTS.md` §4 pide documentar la interfaz faltante en lugar de
> construir un diseño genérico no relacionado.

---

## 1. Current state / Estado actual

EN: `apps/web` is today the unmodified `create-next-app` scaffold. It contains
only the default `app/page.tsx` starter, `app/layout.tsx` and `globals.css`. There
is no portfolio screen, no navigation, no 3D scene and no contact form. Nothing of
the Stitch design has been implemented yet.

ES: `apps/web` es hoy el andamiaje sin modificar de `create-next-app`. Solo
contiene el starter por defecto `app/page.tsx`, `app/layout.tsx` y `globals.css`.
No hay pantalla del portafolio, ni navegación, ni escena 3D, ni formulario de
contacto. Nada del diseño de Stitch se ha implementado aún.

EN: Because of that, this integration step delivered the **data layer** and did
**not** invent screens. The Stitch composition in
`stitch-reference/technical_brief.md` remains the source of truth for the visual
phase and will consume the layer described in
[api-integration.md](./api-integration.md).

ES: Por eso, este paso de integración entregó la **capa de datos** y **no** inventó
pantallas. La composición de Stitch en `stitch-reference/technical_brief.md`
sigue siendo la fuente de verdad para la fase visual y consumirá la capa descrita
en [api-integration.md](./api-integration.md).

---

## 2. Pending screens and forms / Pantallas y formularios pendientes

| Feature (PRD) | Status | API it will consume | Notes |
| --- | --- | --- | --- |
| Typographic project index | Not built | `listProjects()` | EN: Empty table → intentional empty state, no demo data. / ES: Tabla vacía → estado vacío intencional, sin datos de demo. |
| Project detail / contextual badge | Not built | `getProjectBySlug(slug)` | EN: `null` → `notFound()`. / ES: `null` → `notFound()`. |
| Experience section | Not built | `listExperience()` | EN: Empty table → empty array. / ES: Tabla vacía → arreglo vacío. |
| Skills section | Not built | `listSkills()` | EN: Never invent certifications. / ES: Nunca inventar certificaciones. |
| Contact form | Not built | `submitContactMessageAction` | EN: Server Action with `useActionState`. / ES: Server Action con `useActionState`. |
| Health indicator (dev only) | Not built | `getHealth()` | EN: Optional dev aid; `503` = degraded, not an error. / ES: Ayuda opcional de desarrollo; `503` = degradado, no error. |
| Interactive cube, backgrounds, GSAP, live clock, About overlay | Not built | none | EN: Visual, no API; out of scope for this step. / ES: Visual, sin API; fuera del alcance de este paso. |

---

## 3. How each screen should consume the layer / Cómo debe consumir cada pantalla

EN:

- **Server Components** for reads. Call the resource function in the component,
  render the data. Wrap the segment with `loading.tsx` (loading state) and
  `error.tsx` (error state). Render an explicit empty state when the array is
  empty.
- **Empty vs error**: an empty array is a valid, calm state; a thrown `ApiError`,
  `ApiNetworkError` or `ApiParseError` is an error state.
- **Contact form**: a Client Component that calls `submitContactMessageAction`
  through `useActionState`. Render `state.status === 'invalid'` per field using the
  error codes, `'success'` as a confirmation, `'error'` as a retryable message,
  and disable the submit button while pending to avoid duplicate submissions.
- **Do not** call the API from a Client Component. The base URL is server-only by
  design; introducing a client fetch would require a `NEXT_PUBLIC_` variable and a
  CORS origin.
- **Styling**: use the Stitch composition and existing Tailwind conventions; do not
  invent new design.

ES:

- **Server Components** para lecturas. Llama a la función de recurso en el
  componente y renderiza los datos. Envuelve el segmento con `loading.tsx` (estado
  de carga) y `error.tsx` (estado de error). Renderiza un estado vacío explícito
  cuando el arreglo esté vacío.
- **Vacío vs error**: un arreglo vacío es un estado válido y tranquilo; un
  `ApiError`, `ApiNetworkError` o `ApiParseError` lanzado es un estado de error.
- **Formulario de contacto**: un Client Component que llama a
  `submitContactMessageAction` mediante `useActionState`. Renderiza
  `state.status === 'invalid'` por campo usando los códigos de error, `'success'`
  como confirmación, `'error'` como mensaje reintentable, y deshabilita el botón de
  envío mientras está pendiente para evitar envíos duplicados.
- **No** llames a la API desde un Client Component. La URL base es solo para el
  servidor por diseño; introducir un fetch de cliente requeriría una variable
  `NEXT_PUBLIC_` y un origen CORS.
- **Estilos**: usa la composición de Stitch y las convenciones de Tailwind
  existentes; no inventes diseño nuevo.

---

## 4. Suggested implementation order (Stitch phase) / Orden sugerido (fase Stitch)

EN: 1) routing/shell and pill navigation; 2) project index from `listProjects()`;
3) project detail + contextual badge from `getProjectBySlug()`; 4) experience and
skills sections; 5) contact form with the Server Action; 6) Three.js/GSAP scene;
7) health indicator if useful in development.

ES: 1) routing/shell y navegación en píldoras; 2) índice de proyectos desde
`listProjects()`; 3) detalle de proyecto + badge contextual desde
`getProjectBySlug()`; 4) secciones de experiencia y habilidades; 5) formulario de
contacto con la Server Action; 6) escena Three.js/GSAP; 7) indicador de salud si
resulta útil en desarrollo.
