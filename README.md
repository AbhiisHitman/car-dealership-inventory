# Driftline Motors: Car Dealership Inventory System

A full-stack dealership inventory app. Customers register, browse the showroom, search and filter by make, model, category and price, and buy cars. Admins add, edit, restock and delete vehicles. The backend is a test-driven Express + PostgreSQL REST API secured with JWTs; the frontend is a React + Tailwind single-page app.

**Live demo:** https://car-dealership-inventory-lyart.vercel.app

![Showroom](docs/screenshots/04-showroom-admin.png)

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [API reference](#api-reference)
- [Run it locally](#run-it-locally)
- [Testing](#testing)
- [Design decisions](#design-decisions)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)

## Features

**Customers**
- Register and sign in (JWT, stored in `localStorage`, restored on reload and dropped on a 401).
- Dashboard with live stats: models on the lot, units available, sold-out count, categories.
- Search by make and model (partial, case-insensitive), filter by category chips and a min/max price range, with results updating as you type (debounced).
- Client-side "in stock only" toggle and sorting by price or name.
- Every vehicle card has a **Purchase** button that is disabled when the quantity is zero.
- Checkout dialog with a quantity stepper; the confirm button is a [FlyingButton](https://reactbits.dev) that lifts off when the order is placed.
- "My garage" lists past purchases, including cars that have since been removed from the catalogue.

**Admins**
- Add, edit, restock and delete vehicles from the same showroom, with server-side validation errors shown in the forms.
- Stock value tile on the dashboard.

**Visuals**: three open-source [React Bits](https://reactbits.dev) components:
- `PatternWaves`: the interactive dot-wave backdrop on every page.
- `CrystalizedBall`: the hero on the landing page and the sign-in / sign-up pages.
- `FlyingButton`: the landing-page call to action and the checkout confirm button.

The layout is responsive down to 360px wide, respects `prefers-reduced-motion`, and uses accessible dialogs, labels and live regions.

## Tech stack

| Layer | Choice |
|---|---|
| API | Node.js, TypeScript, Express 5, zod validation, helmet, cors |
| Auth | bcrypt password hashing, JWT (HS256) bearer tokens, role-based access (`user` / `admin`) |
| Database | PostgreSQL: [Neon](https://neon.tech) in production; [PGlite](https://pglite.dev) (real Postgres compiled to WebAssembly, persisted to `.data/`) for local development and tests |
| Frontend | React 19, React Router, Tailwind CSS v4, Vite, lucide icons, ogl (WebGL for the React Bits components) |
| Tests | Vitest, Supertest, Testing Library, jsdom, V8 coverage |
| Hosting | Vercel (static SPA + one serverless function for the API) |

## Architecture

```
src/                         React SPA
  pages/                     Landing, Login, Register, Inventory (dashboard), Purchases, 404
  components/                VehicleCard, FilterBar, dialogs, StatsStrip, Navbar, route guards
  components/reactbits/      FlyingButton, CrystalizedBall, PatternWaves (+ .d.ts types)
  context/                   AuthContext, ToastContext
  hooks/                     useInventory (list vs search, debounce, stale-response guard)
  lib/                       typed API client, formatting, vehicle illustration helpers

server/src/                  Express API, layered
  routes/                    HTTP only: parse, validate, call a service, send JSON
  services/                  business rules (AuthService, VehicleService, InventoryService, TokenService)
  repositories/              SQL only (UserRepository, VehicleRepository, InventoryRepository)
  db/                        Database interface + PGlite / pg adapters, idempotent migrations
  middleware/                authenticate, requireRole, JSON error handler
  validation/                zod schemas and the validate() helper
  container.ts               composition root (dependency injection by constructor)
  bootstrap.ts               migrate, seed demo data once, provision the admin
api/index.ts                 Vercel serverless entry: forwards every /api/* request to Express
```

Requests flow `route -> service -> repository -> Database`. Each layer depends only on the one below it through constructor-injected interfaces, so the services are unit-testable and the repositories never know whether they talk to PGlite or Neon.

**Data model**

| Table | Columns |
|---|---|
| `users` | `id` (uuid), `name`, `email` (unique, lower-cased), `password_hash`, `role` (`user` / `admin`), `created_at` |
| `vehicles` | `id` (uuid), `make`, `model`, `category`, `price` (numeric, >= 0), `quantity` (int, >= 0), `year`, `color`, `description`, timestamps |
| `purchases` | `id`, `user_id`, `vehicle_id` (set null if the vehicle is deleted), `vehicle_label`, `quantity`, `unit_price`, `created_at` |
| `app_meta` | key/value flags (records that the demo catalogue was seeded) |

## API reference

All responses are JSON. Errors always look like `{ "error": { "message": "...", "details": [{ "field": "...", "message": "..." }] } }`.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create an account `{ name, email, password }`; returns `{ user, token }` |
| POST | `/api/auth/login` | public | `{ email, password }`; returns `{ user, token }` |
| GET | `/api/auth/me` | signed in | Current user |
| GET | `/api/vehicles` | signed in | All vehicles |
| GET | `/api/vehicles/search` | signed in | Query: `make`, `model`, `category`, `minPrice`, `maxPrice` (all optional, combined with AND) |
| GET | `/api/vehicles/stats` | signed in | Dashboard totals and category list |
| GET | `/api/vehicles/:id` | signed in | One vehicle |
| POST | `/api/vehicles` | admin | Add a vehicle `{ make, model, category, price, quantity?, year?, color?, description? }` |
| PUT | `/api/vehicles/:id` | admin | Update any subset of the fields above |
| DELETE | `/api/vehicles/:id` | admin | Delete a vehicle (204) |
| POST | `/api/vehicles/:id/purchase` | signed in | `{ quantity? = 1 }`; decreases stock, returns `{ vehicle, purchase }`; 409 if not enough stock |
| POST | `/api/vehicles/:id/restock` | admin | `{ quantity }`; increases stock |
| GET | `/api/purchases` | signed in | The caller's purchase history, newest first |
| GET | `/api/health` | public | Liveness check |

Send the token as `Authorization: Bearer <token>`. Status codes: 400 validation, 401 missing or invalid token, 403 not an admin, 404 unknown vehicle (including malformed ids), 409 duplicate email or insufficient stock.

## Run it locally

**Prerequisites:** Node.js 20 or newer (developed on Node 26) and npm. No database install is needed.

```bash
git clone https://github.com/AbhiisHitman/car-dealership-inventory.git
cd car-dealership-inventory
npm install
cp .env.example .env
npm run dev
```

`npm run dev` starts both halves:

- **Backend**: the API on http://localhost:4000 (`npm run dev:api`, `tsx watch`). With `DATABASE_URL` empty it uses the embedded PGlite Postgres stored in `.data/pglite`. On first start it creates the schema, seeds 16 demo vehicles and creates the admin account from `.env`.
- **Frontend**: the Vite dev server on http://localhost:5173 (`npm run dev:web`), which proxies `/api` to the backend.

Open http://localhost:5173 and either create an account or sign in with the demo admin from `.env.example`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dealership.test` | `Admin@12345` |
| Customer | register any email | at least 8 characters |

To use your own Postgres instead, set `DATABASE_URL` in `.env` (for example `postgres://user:pass@localhost:5432/dealership`) and run `npm run seed` once, or just start the API.

| Script | What it does |
|---|---|
| `npm run dev` | API and web together |
| `npm run dev:api` / `npm run dev:web` | One side only |
| `npm test` | Whole test suite once |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with a coverage report in `coverage/` |
| `npm run typecheck` | TypeScript across server, API function and SPA |
| `npm run build` | Typecheck and build the SPA into `dist/` |
| `npm run seed` | Apply the schema, demo data and admin account, then exit |

### Environment variables

| Name | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | empty (PGlite) | Postgres connection string |
| `JWT_SECRET` | dev-only fallback | Required in production |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `API_PORT` | `4000` | Local API port |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | unset | Admin account created on start if missing |
| `SEED_DEMO_DATA` | `true` | Seed the demo catalogue on an empty database (once) |
| `CORS_ORIGIN` | unset | Comma-separated origins if the SPA is hosted elsewhere |

## Testing

```bash
npm test               # 144 tests
npm run test:coverage  # with coverage
```

The full results, per-file counts and every test case are in **[docs/TEST_REPORT.md](docs/TEST_REPORT.md)**.

| Suite | Tests | Notes |
|---|---|---|
| API | 88 | Supertest against the real Express app and a fresh in-memory Postgres (PGlite) per file |
| Web | 56 | Testing Library in jsdom; pages are rendered inside the real providers with the API client mocked |
| Coverage | 93.1% statements, 90.5% branches, 94.9% lines | |

What the API tests pin down includes:
- validation and duplicate emails
- admin-only routes
- case-insensitive partial search with LIKE wildcards escaped
- inclusive price ranges
- a concurrency test proving six simultaneous purchases of a three-unit car sell exactly three
- purchase history surviving a vehicle's deletion
- 500s that never leak internal messages

**Test-driven workflow.** The backend was built red-green-refactor, and the commit history shows it: each feature starts with a `test(...)` commit of failing specs, followed by the `feat(...)` commit that makes them pass, and a `refactor(...)` commit once green:

```
test(auth)       -> feat(auth)
test(vehicles)   -> feat(vehicles)
test(inventory)  -> feat(inventory)
test (bootstrap) -> feat(api) -> refactor(api)
```

## Design decisions

- **Adding and updating vehicles is admin-only.** The brief marks only delete and restock as admin-only, but it also puts the add/update forms under "For Admin Users". Letting customers edit prices would be a security hole, so `POST` and `PUT /api/vehicles` require the admin role too.
- **Purchases are atomic.** A single SQL statement (`UPDATE ... WHERE quantity >= n RETURNING` + `INSERT` in a CTE) decrements stock and records the sale. The guard is re-checked under the row lock, so concurrent buyers can never oversell. When nothing is updated, the service reports whether the car is missing (404) or how many are left (409).
- **Admins cannot be created through the API.** Registration always creates customers, even when `role: "admin"` is posted. The admin comes from environment variables at start-up.
- **One Postgres everywhere.** PGlite gives every developer and every test file a real, isolated Postgres with zero setup, and production uses Neon. Both satisfy the same three-method `Database` interface.
- **Serverless-friendly start-up.** Migrations are idempotent and the demo seed is claimed through `app_meta`, so cold starts are safe. Deleting every vehicle on purpose does not bring the demo cars back.
- **Consistent errors.** Domain errors carry their HTTP status, and one middleware maps them to JSON. Login uses the same message for an unknown email and a wrong password, so accounts can't be enumerated.

## Deployment

The app runs on Vercel as a static Vite build plus one Node serverless function (`api/index.ts`). `vercel.json` rewrites `/api/*` to that function and every other path to `index.html` for client-side routing. The database is a Neon Postgres added through the Vercel Marketplace, which provides `DATABASE_URL`. `JWT_SECRET` and the `ADMIN_*` variables are set as encrypted project environment variables. Every push to `main` deploys to production.

To deploy your own copy:
1. Import the repository in Vercel.
2. Add a Neon (or any Postgres) database.
3. Set `JWT_SECRET` and the `ADMIN_*` variables.
4. Deploy.

The schema and demo data are created on the first request.

## Screenshots

| | |
|---|---|
| ![Landing page](docs/screenshots/01-landing.png) Landing page: PatternWaves backdrop, CrystalizedBall hero and the FlyingButton call to action | ![Sign up](docs/screenshots/03-register.png) Sign up |
| ![Search and filters](docs/screenshots/05-search-filters.png) SUVs under $70,000 | ![Checkout](docs/screenshots/06-purchase-liftoff.png) Checkout: the order is placed and the button takes off |
| ![Admin edit](docs/screenshots/07-admin-edit.png) Admin editing a vehicle | ![Garage](docs/screenshots/08-garage.png) Purchase history |

<p align="center"><img src="docs/screenshots/09-mobile-showroom.png" alt="Showroom on a phone" width="300" /></p>

## My AI Usage

**Tools.** I used an AI coding assistant (chat plus an agent that can edit files and run commands in my terminal) throughout the project.

**How I used it.**
- **Planning:** turning the kata brief into an architecture: the route, service and repository layers, the PGlite-locally / Neon-in-production database setup, and the Vercel layout.
- **Tests first:** drafting the failing specs for each backend feature (auth, vehicle CRUD, search, inventory, bootstrap), including edge cases such as LIKE-wildcard escaping and the concurrent-purchase test, before writing the implementation.
- **Implementation:** generating boilerplate for the Express middleware, repositories, zod schemas and React components, then integrating the React Bits components I chose (PatternWaves, CrystalizedBall, FlyingButton).
- **Debugging and review:** running the suite, smoke-testing the API and UI in a browser, and fixing what it found, such as the missing PGlite data directory on a fresh clone, blank prices being saved as $0, and truncated stat labels on phones.
- **Docs and deployment:** drafting this README and the test report, and setting up Vercel with a Neon database.

I made the product and design decisions myself: admin-only vehicle editing, the atomic purchase rule, the visual direction and which components to use. I reviewed the generated code and checked every change against the tests and in the running app.

**Reflection.** The assistant made the red-green-refactor loop fast: writing a thorough failing spec was cheap, so I wrote more of them and caught edge cases (overselling, leaked error messages, account enumeration) I might otherwise have skipped. It was weakest when it couldn't observe results directly, such as WebGL rendering or GitHub's display, so I still had to run the app, look at it and correct course. Overall it shifted my time from typing boilerplate to specifying behaviour and reviewing it.

The raw chat logs are in [PROMPTS.md](PROMPTS.md).

## Credits

The `FlyingButton`, `CrystalizedBall` and `PatternWaves` components come from [React Bits](https://reactbits.dev), used as published (JavaScript + CSS variants). Vehicle names and specs in the demo catalogue are illustrative.
