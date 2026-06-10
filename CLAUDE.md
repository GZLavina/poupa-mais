# CLAUDE.md

Guidance for AI sessions working in this repository.

## What this is

**PoupaMais** — a small personal-finance app whose **primary purpose is didactic**: to make architectural patterns (layering, CQRS-light, DDD, Flux/Redux, REST boundaries, JWT, versioned SQL) **visible and comparable in real code**. The goal is not the smallest possible implementation, nor artificial complexity — prefer one complete, well-bounded vertical slice over many disconnected screens. Read `docs/contexto-arquitetural-para-sessoes-agenticas.md` first; it is the north star.

Two apps:
- `poupa-mais-backend/` — Java 21, Spring Boot (Web MVC, Security, Data JPA, Flyway), H2 in-memory, JWT.
- `poupa-mais-frontend/` — React + TypeScript + Vite, Redux Toolkit, RTK Query.

## Commands

Backend (run from `poupa-mais-backend/`):
- `./mvnw test` — run all tests.
- `./mvnw spring-boot:run` — start the API on **http://localhost:8081** (`server.port`).

Frontend (run from `poupa-mais-frontend/`):
- `npm install` then `npm run dev` — dev server on http://localhost:5173 (in the backend CORS allowlist).
- `npm run lint` and `npm run build` — always run both before considering frontend work done.

## Conventions (match these)

- **Naming is English** in code and routes (`User`, `Category`, `Transaction`, `/transactions`, `INCOME`/`EXPENSE`), even though the design docs use Portuguese (`Transacao`, `RECEITA`). This is a deliberate, consistent choice — follow it. Domain vocabulary in docs is the conceptual reference only.
- **Backend layering:** Controller (HTTP + auth principal + `@Valid` DTOs) → Service (`@Transactional`, business rules) → Repository (Spring Data JPA). Organized by feature package: `user`, `auth`, `category`, `transaction`, `summary`, `security`, `common`.
- **DTOs guard the API boundary** — never expose JPA entities; responses omit internal fields (e.g. `passwordHash`).
- **Ownership isolation:** the authenticated user comes from the security principal (`@AuthenticationPrincipal AuthenticatedUser`), never from the request body. Writes/queries filter by `userId` (e.g. `findByIdAndUserId`). Official financial rules (balance, totals) are computed in the **backend**, not the frontend.
- **Errors** are centralized in `common/GlobalExceptionHandler` → `ApiError` (400/401/403/404/409/500). Add a typed exception in `common` rather than ad-hoc statuses.
- **Schema** is Flyway-versioned (`src/main/resources/db/migration/V*.sql`); Hibernate runs with `ddl-auto=validate`, so entity and migration must match exactly.
- **Frontend server state** (categories, transactions, balance) goes through RTK Query (`src/api/poupaMaisApi.ts`) with tag invalidation. Session state (token) lives in `authSlice`; UI state is local React. Currency/date formatting lives in `src/utils/`.

## Current status

Implemented and verified end-to-end (all backend tests passing):
- Auth: `POST /users`, `POST /auth/login` (JWT); frontend login/signup, token in `localStorage`.
- Categories: full CRUD incl. `GET /categories`; frontend Categorias screen (RTK Query, edit-by-selection).
- Transactions (UC-01): `Transaction` entity, `V2` migration, `POST`/`GET /transactions`; frontend Transações screen (type toggle, real category dropdown, type/category/date filters).
- Saldo/Dashboard (UC-02): `GET /summary/balance` (SQL `SUM ... GROUP BY type`, optional date range); Dashboard KPIs + "últimas transações" + period selector wired to real data.
- Sumário (UC-05): `GET /summary/by-category` (SQL `SUM ... GROUP BY category, type`, optional date range + optional `type` filter; per-category percentages computed in the backend); frontend `features/summary/CategoryDistribution` (Despesas/Receitas toggle, per-category bars) replaces the old Dashboard chart placeholder, wired to the period selector.

Not yet implemented (likely next work):
- Real routing with protected routes (navigation is still `currentView` state in `App.tsx`).
- Frontend automated tests.

## Gotchas

- **H2 is in-memory** — data resets on every backend restart, and there is no `GET /users` or seed, so re-register a user each run.
- The Dashboard's **balance summary on the Transações screen is display-only** (derived from the fetched rows); the official balance is `GET /summary/balance`.
- The **category "Ativa" pill is a hardcoded placeholder** — there is no `active` field yet (a documented future feature: inactivate-instead-of-delete).

## Documentation map

- `docs/contexto-arquitetural-para-sessoes-agenticas.md` — architectural north star and decision criteria. **Read first.**
- `docs/sprint-3/Documento de Realização de Caso de Uso.md` — the 5 core use-case specs.
- `poupa-mais-frontend/README.md` — **accurate** current-status snapshot of the frontend.
- `poupa-mais-frontend/docs/ui-improvements/plano-melhoria-ui.md` — 5-phase UI roadmap (phases 1–4 + saldo done).
- `docs/sprint-3/apresentacao-decisoes-arquiteturais.md` — good for *why* behind each pattern, but **STALE**: predates the transactions/saldo work and still lists them as pending. Trust the README for status, not this deck.
