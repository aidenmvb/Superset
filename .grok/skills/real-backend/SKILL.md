---
name: real-backend
description: >
  Always use the real Express + SQLite backend for the Superset peptide project —
  never mock data, hard-coded product arrays, fake APIs, or MSW stubs for catalog,
  inventory, orders, or contact. Use when building features, pages, API clients,
  checkout, admin tools, tests that hit data, or whenever the user works on this
  repo's storefront/backend. Triggers: mock data, fake API, stub, hardcode products,
  in-memory store, "just use dummy data", scaffold UI, new product page, checkout.
  Slash: /real-backend
---

# Real Backend Only (Superset)

This project is a **peptide research storefront** with a real stack:

- **Frontend:** `client/` (React + Vite)
- **Backend:** `server/` (Express + better-sqlite3)
- **Database:** `server/data/superset.db` (created at runtime)
- **API base:** `http://localhost:3001/api` (Vite proxies `/api` → backend)

## Non-negotiable rules

1. **Never** introduce mock/hard-coded product lists, fake order responses, or placeholder inventory in the React app for production UI paths.
2. **Never** replace API calls with local JSON fixtures for catalog, categories, stock, orders, or contact — unless the user explicitly asks for an offline prototype (then still keep the real API path intact).
3. **Always** read/write business data through the Express API and SQLite tables.
4. **Always** extend the real backend when new data is needed: schema in `server/src/db.js`, seed in `server/src/seed.js`, routes under `server/src/routes/`, client calls in `client/src/api.js`.
5. Cart may use `localStorage` for **client-side cart UX only**. Checkout must `POST /api/orders` and persist to SQLite.
6. If the API is down, show an error that tells the user to start the server — do not silently fall back to mock data.

## How to run (local)

```bash
# repo root
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

- Client: http://localhost:5173  
- API: http://localhost:3001  
- Health: http://localhost:3001/api/health  

## Existing real endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/api/health` | Liveness + DB counts |
| GET | `/api/products` | List (`category`, `featured`, `q`, `inStock`) |
| GET | `/api/products/:idOrSlug` | Detail |
| GET | `/api/categories` | Categories + counts |
| POST | `/api/orders` | Verify Stripe PaymentIntent + create paid order |
| GET | `/api/orders/:orderNumber` | Order detail |
| POST | `/api/contact` | Persist contact message |
| GET | `/api/payments/config` | Stripe publishable key |
| POST | `/api/payments/create-intent` | Create PaymentIntent (DB-priced) |
| POST | `/api/webhooks/stripe` | Stripe webhooks |

Checkout must use **real Stripe** (Payment Element + Address Element). Never fake payment success client-side. Orders require a succeeded PaymentIntent verified on the server.

## When adding a feature

1. Design the SQLite schema change (tables/columns) first.
2. Update `initSchema()` and seed data if needed.
3. Add/adjust Express route handlers with validation and real SQL.
4. Add a function in `client/src/api.js` that calls the route.
5. Wire React pages to that API function with loading + error states.
6. Verify with the running server (`curl` or the UI), not with invented arrays.

## Forbidden patterns

```js
// BAD — mock catalog
const products = [{ id: 1, name: 'BPC-157', price: 49.99 }];

// BAD — fake fetch
export async function getProducts() {
  return { products: MOCK_PRODUCTS };
}

// BAD — "temporary" in-memory orders as the source of truth
const orders = [];
```

```js
// GOOD — real API
import { getProducts } from './api';
const { products } = await getProducts({ category: 'recovery' });
```

## Tests

- Prefer integration tests against the real server + a temp SQLite file (`DB_PATH`).
- Do not assert against hard-coded mock modules that bypass the database for core commerce flows.

## Quick checklist before finishing work

- [ ] New data lives in SQLite (or is derived from it)
- [ ] New UI loads via `/api/...`
- [ ] No new mock product/order arrays in `client/`
- [ ] Seed updated if catalog shape changed
- [ ] Backend still starts and `/api/health` returns `ok: true`
