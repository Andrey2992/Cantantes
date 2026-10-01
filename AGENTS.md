# AGENTS.md

## 1. Project Identity

This repository contains the personal digital identity and professional portfolio of Isaac Andrey Sánchez.

The project is not intended to be a generic developer portfolio or a simple landing page.

Its purpose is to present:

* Systems Engineering
* Software Architecture
* Backend Engineering
* Databases
* Cloud Technologies
* Creative Computing
* WebGL / Three.js
* Interactive Web Experiences
* Professional Projects and Case Studies

The visual experience is based on the Google Stitch specification located at:

`stitch-reference/technical_brief.md`

That document is the primary source of truth for the intended visual design and interaction model of the frontend.

---

## 2. Repository Architecture

This project is a monorepo.

The repository must follow this high-level structure:

```text
/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared/
│   └── types/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── stitch-reference/
│   └── technical_brief.md
│
├── .opencode/
│   ├── skills/
│   └── agents/
│
├── AGENTS.md
├── README.md
├── package.json
├── docker-compose.yml
└── .gitignore
```

### Application responsibilities

`apps/web`

Frontend application.

`apps/api`

Backend API.

`packages/shared`

Shared utilities that are genuinely framework-independent and useful to multiple applications.

`packages/types`

Shared TypeScript contracts and types that need to be consumed by both frontend and backend.

`database`

Database-related resources such as migrations and seed data.

`stitch-reference`

Design and product documentation generated from the Stitch project.

---

# 3. Frontend

## Technology

The frontend stack is:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Three.js
* GSAP

The frontend must preserve the design and interaction model defined in:

`stitch-reference/technical_brief.md`

The Stitch PRD has priority for visual and interaction requirements.

The implementation may change internally when required to integrate React, Next.js or the overall architecture, but the resulting user experience should remain faithful to the Stitch design.

---

## 4. Frontend Design Rules

Do not replace the Stitch design with a generic portfolio template.

Do not introduce unnecessary:

* Hero sections
* Generic project-card grids
* Dashboard-style layouts
* Generic SaaS components
* Excessive glassmorphism
* Random gradients
* Excessive animations
* Unnecessary UI libraries

The following concepts defined by the Stitch PRD must remain core parts of the experience:

* Pill navigation
* Editorial/brutalist typography
* Large typographic project index
* Interactive Three.js cube
* Translucent geometry
* Wireframe cage
* Inner octahedron
* Pointer drag rotation
* Spacebar rotation boost
* Dynamic atmospheric backgrounds
* GSAP transitions
* Contextual project badge
* Bottom interaction prompt
* Live clock
* About overlay
* WebGL fallback

When a technical implementation differs from the original Stitch specification, preserve the visual result and user interaction whenever reasonably possible.

---

# 5. Three.js and WebGL

Three.js is a first-class part of the frontend.

The WebGL experience must follow the concepts defined in the Stitch PRD.

Important requirements include:

* Translucent hollow cube
* Outer wireframe cage
* Inner octahedron
* Pointer-based rotation
* Inertial rotation
* Spacebar acceleration
* Floating motion
* Dynamic textures
* Dynamic visual states
* Graceful WebGL fallback

Three.js resources must be cleaned up correctly.

Dispose of:

* Geometries
* Materials
* Textures
* Render targets
* Other disposable WebGL resources

when they are no longer required.

Avoid unnecessary reinitialization of the WebGL scene.

---

# 6. GSAP and Motion

GSAP is used for intentional motion and visual transitions.

Use animation for:

* Background transitions
* Cube transitions
* Visual state changes
* UI micro-interactions
* Smooth state transitions

Avoid unnecessary perpetual animation.

Animations should preserve performance and should not negatively affect interaction responsiveness.

Respect reduced-motion preferences where appropriate.

---

# 7. Backend

## Technology

The backend stack is:

* NestJS
* TypeScript
* Prisma
* PostgreSQL

The backend is a modular monolith.

Do not introduce microservices.

Do not split the system into independent deployable services unless explicitly requested.

---

# 8. Backend Architecture

The backend follows Domain-Driven Design.

The main layers are:

```text
Domain
Application
Infrastructure
Presentation
```

Each layer has a clear responsibility.

---

## Domain

The Domain layer contains business rules and domain concepts.

Possible initial domains include:

* Project
* Experience
* Skill
* Contact

Only create domain concepts that represent meaningful business concepts for the portfolio.

The Domain layer must not depend on:

* NestJS
* Prisma
* PostgreSQL
* HTTP
* Controllers
* Framework-specific infrastructure

The domain should remain independently testable.

---

## Domain Components

Where appropriate, domain modules may contain:

```text
domain/
└── project/
    ├── entities/
    ├── value-objects/
    ├── repositories/
    └── services/
```

Do not create entities, value objects or services solely to make the architecture look more complex.

---

# 9. Application Layer

The Application layer contains use cases.

Examples:

```text
application/
└── project/
    └── use-cases/
        ├── create-project
        ├── get-project
        ├── get-projects
        └── update-project
```

Use cases coordinate domain behavior.

Do not place business rules directly inside controllers.

Do not place business rules directly inside React components.

---

# 10. Infrastructure Layer

Infrastructure contains implementations and framework-specific concerns.

Examples:

```text
infrastructure/
├── database/
├── repositories/
├── config/
└── external-services/
```

Repository implementations belong here.

Prisma belongs here.

PostgreSQL-specific logic belongs here.

The infrastructure layer may depend on the Domain and Application layers as necessary, but the Domain must not depend on Infrastructure.

---

# 11. Presentation Layer

The Presentation layer exposes the backend through HTTP/API interfaces.

It may contain:

```text
presentation/
├── controllers/
├── routes/
├── dto/
├── middleware/
└── guards/
```

Controllers should remain thin.

Controllers should:

1. Receive requests.
2. Validate or delegate request validation.
3. Invoke application use cases.
4. Transform the result into an HTTP response.

Do not place domain logic inside controllers.

---

# 12. PostgreSQL

PostgreSQL is the project's primary relational database.

The database should run locally through Docker during development.

The development environment should use:

```text
Docker
   ↓
PostgreSQL
   ↓
Prisma
   ↓
NestJS
```

Database credentials must never be committed to Git.

Use environment variables for configuration.

The expected connection configuration should use:

`DATABASE_URL`

---

# 13. Prisma

Prisma is the persistence layer used by the backend.

Prisma models represent persistence concerns.

Do not expose Prisma models directly as Domain entities.

Do not import Prisma into Domain code.

Repository interfaces belong to the Domain layer.

Repository implementations using Prisma belong to Infrastructure.

Example:

```text
domain/project/repositories/ProjectRepository.ts
```

and:

```text
infrastructure/repositories/PrismaProjectRepository.ts
```

The infrastructure implementation should adapt Prisma persistence to the domain repository contract.

---

# 14. Database Migrations

Database schema changes must be represented through versioned migrations.

Do not manually modify the production database schema.

Do not delete or rewrite migrations casually.

Seed data should only contain useful development or demonstration data.

---

# 15. API

The frontend communicates with the backend through an explicit API boundary.

The frontend must not communicate directly with PostgreSQL.

The expected flow is:

```text
Next.js
   ↓
HTTP/API
   ↓
NestJS
   ↓
Application
   ↓
Domain
   ↓
Infrastructure
   ↓
Prisma
   ↓
PostgreSQL
```

Keep API contracts explicit and typed where practical.

---

# 16. Shared Packages

Only place code in `packages/shared` or `packages/types` when it is genuinely shared.

Do not move application logic there simply to avoid duplication.

Avoid creating a shared package prematurely.

---

# 17. AutoSkills

The project may use AutoSkills to install or maintain technology-specific development skills.

Technology-specific skills may include:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Three.js
* GSAP
* NestJS
* Prisma

AutoSkills must complement, not replace, the project's own architecture rules.

Project-specific skills should remain in:

`.opencode/skills/`

Examples:

```text
.opencode/skills/
├── domain-driven-design/
├── portfolio-architecture/
├── stitch-visual-fidelity/
├── threejs-webgl/
├── accessibility/
└── performance/
```

Technology-specific skills and project-specific skills must not contradict the rules defined in this file.

When conflicts exist, project architecture and explicit repository instructions take precedence.

---

# 18. Code Quality

Prefer:

* Type safety
* Small focused modules
* Explicit dependencies
* Clear naming
* Maintainable code
* Testable behavior
* Strong separation of concerns
* Simple solutions
* Incremental implementation

Avoid:

* Premature abstraction
* Unnecessary design patterns
* Unnecessary libraries
* Unnecessary dependencies
* Deeply coupled modules
* Business logic in UI components
* Business logic in controllers
* Direct database access from the frontend

---

# 19. Testing

Testing should be introduced alongside meaningful domain and application behavior.

Prioritize:

* Domain tests
* Application/use-case tests
* API tests
* Integration tests
* Critical frontend interaction tests

Do not create meaningless tests solely to increase coverage percentages.

---

# 20. Accessibility

The interactive portfolio must remain usable for users who cannot rely entirely on pointer input.

Use:

* Semantic HTML
* Keyboard interaction
* Focus management
* Appropriate labels
* Accessible controls
* Reduced-motion support
* Sufficient contrast

The WebGL layer must not be the only way to understand or interact with important information.

---

# 21. Performance

The frontend should target the performance requirements described by the Stitch PRD.

Important principles:

* Avoid unnecessary React re-renders.
* Avoid unnecessary client components.
* Optimize images and assets.
* Dispose WebGL resources.
* Avoid unnecessary JavaScript.
* Prefer GPU-friendly animation.
* Keep interactions responsive.
* Provide a graceful fallback when WebGL is unavailable.

The interactive WebGL experience should aim for smooth rendering on typical modern integrated GPUs.

---

# 22. Responsive Design

The original Stitch composition targets desktop and laptop browsers.

The implementation must preserve the design while adapting appropriately to smaller screens.

Do not simply shrink the desktop layout.

Create intentional responsive behavior for:

* Laptop
* Tablet
* Mobile

When responsive behavior is undefined by the PRD, choose the solution that best preserves the visual hierarchy and usability of the original design.

---

# 23. Content

The Stitch PRD contains demonstration content such as artist names and example media.

Do not automatically assume that demonstration content represents the final portfolio content.

Treat that content as part of the current visual specification unless it is explicitly replaced by the project owner.

Do not invent professional experience, projects, skills, achievements, certifications or employment history.

---

# 24. Source of Truth

Priority order:

1. Explicit user requirements
2. This AGENTS.md
3. `stitch-reference/technical_brief.md`
4. Existing executable project configuration
5. Framework conventions

When code and documentation disagree:

* Prefer working executable configuration when understanding current behavior.
* Prefer explicit user requirements for intended future architecture.
* Ask for direction only when a conflict materially affects the implementation.

---

# 25. OpenCode Working Rules

Before implementing a large feature:

1. Inspect the existing repository.
2. Read this AGENTS.md.
3. Read the relevant sections of the Stitch PRD.
4. Identify affected modules.
5. Explain significant architectural changes before making them.
6. Implement incrementally.
7. Verify the implementation.
8. Do not modify unrelated areas.

Do not regenerate the entire application unnecessarily.

Do not rewrite working code to introduce a preferred style unless there is a clear benefit.

Do not fabricate configuration, scripts or dependencies.

Only run commands that exist in the current project configuration.

---

# 26. Architectural Decision Rule

The project should demonstrate professional engineering without becoming artificially complex.

The primary goal is:

```text
Excellent personal portfolio
        +
Excellent interactive frontend
        +
Real backend
        +
Real database
        +
Clean DDD architecture
```

Not:

```text
Maximum number of technologies
```

Every architectural decision should provide a real benefit to the project.

---

# 27. Current Implementation Strategy

Implementation order should generally be:

1. Establish monorepo structure.
2. Create frontend application.
3. Create backend application.
4. Establish shared TypeScript configuration.
5. Configure PostgreSQL with Docker.
6. Configure Prisma.
7. Define initial domain model.
8. Implement backend use cases and API.
9. Connect frontend to API.
10. Reproduce the Stitch frontend faithfully.
11. Implement Three.js and GSAP interactions.
12. Add tests.
13. Optimize performance and accessibility.
14. Prepare deployment.

Do not skip architectural boundaries merely to implement the frontend faster.

---

# 28. Final Principle

This project represents Isaac Sánchez professionally.

The codebase should therefore demonstrate:

* Good engineering judgment
* Clear architecture
* Maintainability
* Performance
* Accessibility
* Strong visual execution
* Real backend engineering
* Real database integration
* Domain-oriented design

The frontend should look and feel like the Stitch design.

The architecture behind it should demonstrate professional software engineering.
