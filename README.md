# Isaac Sánchez — Interactive WebGL Portfolio

Monorepo for the personal digital identity and professional portfolio of
**Isaac Andrey Sánchez Delgado** (Systems Architecture & Creative Computing).

The frontend is an editorial/brutalist interactive WebGL experience driven by a
Three.js cube, GSAP transitions and dynamic atmospheric backgrounds. The backend
is a NestJS modular monolith organized with Domain-Driven Design.

> The visual and interaction specification lives in
> [`stitch-reference/technical_brief.md`](./stitch-reference/technical_brief.md).
> It is the source of truth for the frontend design.
> Architecture rules live in [`AGENTS.md`](./AGENTS.md).

---

## 1. Repository Structure

```text
/
├── apps/
│   ├── web/                    # Next.js + React + TypeScript + Tailwind frontend
│   └── api/                    # NestJS + TypeScript backend (modular monolith, DDD)
│
├── packages/
│   ├── shared/                 # Framework-independent helpers used by 2+ apps
│   └── types/                  # TypeScript contracts shared by web + api
│
├── database/
│   ├── migrations/             # Versioned schema migrations (empty for now)
│   └── seeds/                  # Development/demo seed data (empty for now)
│
├── stitch-reference/           # Product/design documentation (read-only)
│
├── .opencode/
│   ├── skills/                 # Project-specific OpenCode skills
│   └── agents/                 # Project-specific OpenCode agents
│
├── AGENTS.md
├── README.md
├── package.json                # npm workspaces root
└── .gitignore
```

### Current state

The repository is **scaffolded only**. There is no domain model, no Prisma
schema, no PostgreSQL configuration and no portfolio UI yet. `apps/api` and
`apps/web` contain framework defaults only.

---

## 2. Requirements

* Node.js >= 20 (verified on Node 24)
* npm >= 10 (verified on npm 11)

Package manager: **npm workspaces** (declared in the root `package.json`).

---

## 3. Installation

```bash
npm install
```

This installs and links every workspace: `apps/web`, `apps/api`,
`packages/types` and `packages/shared`.

---

## 4. Running the applications

Run each application in its own terminal from the repository root.

### Frontend — `apps/web` (Next.js)

```bash
npm run dev:web
```

or, from inside the app:

```bash
cd apps/web
npm run dev
```

Default URL: <http://localhost:3000>

### Backend — `apps/api` (NestJS)

```bash
npm run dev:api
```

or, from inside the app:

```bash
cd apps/api
npm run start:dev
```

Default URL: <http://localhost:3001> (health check: `GET /`)

> Change the API port with the `PORT` environment variable.

### Production mode

```bash
npm run build       # builds packages, then api, then web
npm run start:api   # node dist/main
npm run start:web   # next start
```

---

## 5. Root Scripts

| Script                 | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev:web`      | Start the Next.js development server                         |
| `npm run dev:api`      | Start the NestJS development server in watch mode            |
| `npm run build`        | Build shared packages, the API and then the web app          |
| `npm run start:web`    | Serve the production web build                               |
| `npm run start:api`    | Run the compiled API (`dist/main`)                          |
| `npm run lint`         | Lint every workspace that defines a `lint` script            |
| `npm run typecheck`    | Type-check every workspace that defines a `typecheck` script |
| `npm run test`         | Run tests in every workspace that defines a `test` script    |

---

## 6. Planned Stack

| Layer            | Technology                        | Status          |
| ---------------- | --------------------------------- | --------------- |
| Frontend         | Next.js, React, TypeScript         | Scaffolded      |
| Styling          | Tailwind CSS                      | Scaffolded      |
| 3D / Motion      | Three.js, GSAP                    | Not installed   |
| Backend          | NestJS, TypeScript                | Scaffolded      |
| Persistence      | Prisma + PostgreSQL (Docker)      | Not configured  |

Dependencies are added incrementally, only when the corresponding feature is
implemented. Do not install libraries speculatively — see `AGENTS.md`
sections 4 and 18.

---

## 7. Backend Architecture (DDD)

`apps/api/src` will be organized by layer, not by framework:

```text
src/
├── domain/          # entities, value objects, repository interfaces, services
├── application/     # use cases that coordinate the domain
├── infrastructure/  # Prisma, repositories, config, external services
├── presentation/    # controllers, routes, DTOs, middleware, guards
└── common/          # cross-cutting framework helpers
```

Dependency rule: `domain` depends on nothing. `infrastructure` implements
`domain` repository interfaces. Controllers stay thin and hold no business
rules.

---

## 8. Git

`.gitignore` excludes dependencies, build output, `.next/`, `dist/`, coverage,
logs, local database artifacts and every `.env*` file except `.env.example`.
Database credentials are never committed.

---

## 9. Roadmap

1. ✅ Monorepo structure
2. ✅ Frontend application
3. ✅ Backend application
4. ✅ Shared TypeScript configuration
5. ⬜ PostgreSQL with Docker
6. ⬜ Prisma
7. ⬜ Initial domain model
8. ⬜ Backend use cases and API
9. ⬜ Connect frontend to API
10. ⬜ Reproduce the Stitch frontend faithfully
11. ⬜ Three.js and GSAP interactions
12. ⬜ Tests
13. ⬜ Performance and accessibility
14. ⬜ Deployment
