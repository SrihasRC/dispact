# AGENTS.md — Event Engine

Non-discoverable landmines and workflow constraints. Do not add anything an agent can learn by reading README, package.json, or source files.

---

## Scope & Routing

- `apps/api` — Fastify ingestion gateway. Read `.agents/skills/fastify-best-practices/SKILL.md` before any changes.
- `apps/worker` — BullMQ worker daemon. No Fastify here — plain Node.js daemon pattern.
- `packages/database` — Shared Prisma package. Both `api` and `worker` import from `@event-engine/database`. Changes here affect both apps.
- `apps/web` — Out of scope until backend is complete.
- Hierarchical AGENTS files: `apps/api/AGENTS.md`, `apps/worker/AGENTS.md`, `packages/database/AGENTS.md` will be added per-package as work progresses.

---

## Non-Discoverable Commands

```bash
# Install deps (not npm/yarn — always pnpm)
pnpm install

# Run a single workspace app
pnpm --filter api dev
pnpm --filter worker dev
pnpm --filter @event-engine/database exec prisma migrate dev

# Type-check a specific app without building
pnpm --filter api exec tsc --noEmit

# Lint a specific app
pnpm --filter api exec eslint src
pnpm --filter worker exec eslint src
```

> **Sandbox caveat**: `git` commands may fail inside the sandbox — run with `BypassSandbox: true` if you get connection reset errors.

---

## Landmines / Do-Not-Touch

- **`.env` is gitignored** — never commit it. Always add new vars to `.env.example` instead.
- **`packages/ui`** — Turborepo scaffold leftover. Not used by backend. Do not add deps to it during backend phases.
- **`README.md`** — Stale Turborepo starter content. Do not update it during backend phases; it will be replaced later.
- **Redis connection**: hardcoded `127.0.0.1:6379` in the existing `apps/api/src/index.ts` stub — this must be replaced by env-driven config in Phase 2. Do not leave hardcoded values.
- **`zod` in `apps/api/package.json`** — currently listed as a dep but is not used. Replace with `@sinclair/typebox` exclusively. Remove `zod`.
- **`pnpm-workspace.yaml` `allowBuilds`** — `esbuild: true` is already set; do not change `allowBuilds` without understanding native module rebuild implications.
- **TypeScript version is `7.0.2`** — newer than most ecosystem docs. Some `tsc` flag names may differ from TS 4/5 docs. Trust compiler errors over documentation.
- **ESLint config does not exist yet** — Phase 0 creates it. Until then, do not run `pnpm lint` in CI.
- **Prisma client is generated** — after schema changes, always run `prisma generate` before `tsc --noEmit`, or type-check will fail with missing generated types.
- **Prisma `.env` discovery** — when running `pnpm --filter @event-engine/database exec prisma migrate dev`, the `.env` at root is NOT auto-loaded. Pass the var inline: `DATABASE_URL="..." pnpm --filter @event-engine/database exec prisma migrate dev`. The initial migration (`20260906150610_init`) has already been applied — do NOT re-run `migrate dev --name init`.

---

## Task-Specific Constraints

### All Agents — Before Every Commit
1. `pnpm --filter <app> exec tsc --noEmit` must pass with zero errors.
2. `pnpm --filter <app> exec eslint src` must pass with zero errors (after Phase 0).
3. Append an entry to `_context/CHANGELOG.md` with the format `- \`<prefix>:\` description`.
4. Commit with a single-line message: `<prefix>: <description>` (no body, no co-author lines).

### Commit Prefixes
| Prefix | When |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `refactor:` | Code restructuring, no behavior change |
| `test:` | Adding or updating tests |
| `docs:` | Documentation only |

### Phase 0 Agent
- Do not add tech-stack descriptions to AGENTS.md (the init skill forbids it).
- ESLint flat config file must be `eslint.config.js` (not `.eslintrc`). Use `neostandard()` as the base. See `.agents/skills/linting-neostandard-eslint9/SKILL.md`.
- When creating `packages/database`, name it `@event-engine/database` in `package.json` so workspace imports resolve correctly.

### Phase 1 Agent
- Run `prisma generate` **before** `tsc --noEmit` — generated types must exist first.
- Do not run `prisma migrate dev` if `DATABASE_URL` is not set — it will silently write a broken migration. Check env first.
- Prisma client singleton in `packages/database/src/index.ts` must guard against multiple instances in development (standard `globalThis` pattern).

### Phase 2 Agent
- Existing `apps/api/src/index.ts` is a throwaway stub — replace it entirely, do not extend it.
- Module augmentation for `FastifyInstance` (adding `redis`, `prisma` decorators) must go in a `src/types/fastify.d.ts` file, not inline in plugin files.
- `buildApp()` in `app.ts` must accept an optional opts param for test overrides — this is required for Phase 7 injection tests.

### Phase 3 Agent
- Existing `apps/worker/src/index.ts` is a throwaway stub — replace it entirely.
- Lua script for token bucket must be loaded as a string literal (not from a `.lua` file) to avoid ESM file-loading issues with `tsx`.
- The `ConnectorRegistry` is a singleton — export the instance, not the class, from `registry.ts`.

### Octocat (on-demand)
- Only activate when a `github.com` URL appears in a prompt.
- Never add `Co-Authored-By:` lines to commits.
- If signing is not configured, proceed without it — do not configure `user.signingkey`.

---

## Phase Assignment Tracker

| Phase | Status | Assigned Agent | Commit |
|---|---|---|---|
| 0 — Scaffolding | ✅ Done | agent-phase-0 | 1d1f533 |
| 1 — Prisma Schema | ✅ Done | agent-phase-1 | a74d103 |
| 2 — API Gateway | ✅ Done | agent-phase-2 | f40a9f2 |
| 3 — Worker | ✅ Done | agent-phase-3 | 0182b0f |
| 4 — Error/DLQ | ✅ Done | agent-phase-4 | d906d43 |
| 5 — Bull Board | ✅ Done | agent-phase-5 | — |
| 6 — Simulator | ✅ Done | agent-phase-6 | 96bac46 |
| 7 — Tests | ⬜ Pending | — | — |
