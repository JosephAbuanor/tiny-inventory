# Tiny Inventory

A small full-stack inventory management app: stores and products, with filtering, pagination, and an inventory-summary API. Monorepo (server + web), TypeScript, Prisma, React, Docker.

## Run

**With Docker:**

```bash
git clone "https://github.com/JosephAbuanor/tiny-inventory"
cd tiny-inventory
docker compose up --build
```

Then open **http://localhost:4000**. The app serves the API and the frontend. Seed data (3 stores, 102 products) is applied on first start.

**Local dev (no Docker):**

1. From repo root: `pnpm install`.
2. In `server/`: copy `.env.example` to `.env`, then `pnpm db:migrate`, `pnpm db:generate` and `pnpm db:seed`.
3. Terminal 1: `pnpm dev:server` (API on http://localhost:4000).
4. Terminal 2: `pnpm dev:web` (Vite on http://localhost:3000, proxies `/api` to the server).

## API sketch

- `GET/POST /api/stores` — list, create
- `GET /api/stores/summaries` — **non-trivial**: per-store product count, total inventory value, low-stock count
- `DELETE /api/stores/:id` — delete store (and all its products)
- `GET /api/products?storeId=&category=&minPrice=&maxPrice=&lowStock=&page=&limit=` — list with filter and pagination
- `GET /api/products/categories?storeId=` — distinct categories (for UI filter)
- `GET/POST /api/products` and `GET/PUT/DELETE /api/products/:id` — CRUD

List products returns `{ data, total, page, limit }`. Errors use `{ error: { message: string, details?: unknown } }` with 4xx/5xx (e.g. validation: `message: "Validation failed"`, `details`: field errors).

## Decisions & Trade-offs

- **Monorepo (server + web):** Clear boundary; shared tooling and one clone. Chose pnpm workspaces.
- **Prisma + SQLite:** Real relations and migrations without an external DB. Postgres could be used for production scale.
- **Single Docker container:** Server serves the built React app and the API so `docker compose up` is one service, one port. Trade-off: no separate scaling of front/back- acceptable for this scope.
- **No auth:** Per assignment; would add API keys or JWT for production.
- **Zod on server:** Request validation and clear error shapes without a heavy framework.
- **Frontend:** Minimal routing (state-based), no global state library; validation mirrors server. Focus on list/detail flow and loading/error/empty states.
- **Categories as string:** I intentionally modeled categories as a simple string field rather than a separate table to keep the domain lightweight and avoid premature complexity. To support the UI, I exposed a derived endpoint that returns distinct category values from existing products. In a larger system with category ownership, permissions, or metadata, this would naturally evolve into a first-class Category model. Categories are also normalized (trimmed and lowercased) on write to avoid duplication.
- **Seeding:** Database seeding runs on container startup to ensure reviewers have data immediately. In a real production setup, seeding would be gated or removed after initial provisioning.

## Testing Approach

**Backend**
- Focus on integration-style API tests using Jest and supertest, exercising the app through HTTP rather than unit-testing individual helpers.
- Add targeted tests for the non-trivial aggregation endpoint `GET /api/stores/summaries` to verify computed values such as total inventory value and low-stock counts.
- Run tests against a separate SQLite database to keep tests fast and deterministic.

**Frontend**
- UI behavior was manually tested by walking through the main flows:
    - store list -> product list
    - filtering by category and low-stock
    - pagination
    - creating, editing, and deleting products

- Loading, error, and empty states were verified visually to ensure predictable user feedback.

**Rationale**
- Prioritize tests that validate observable behavior and contracts over exhaustive unit tests, given the size of the application and time period.


## If I had more time

1. **E2E/Unit tests** - Playwright for "select store -> filter products -> edit product" and "create product" to guard regressions. Unit testing necessary functions.
2. **Export inventory to CSV** - Download store/product data for reporting.
3. **Better display and layout** - Refine spacing, alignment, and responsive behavior across screens. Stronger visual hierarchy, palette, and polish for better UI/UX.
