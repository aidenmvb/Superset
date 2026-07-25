# Superset Research Peptides

Full-stack research peptide storefront: **React (Vite)** frontend + **Express + SQLite** backend.

> **Rule for this project:** always use the real backend and database. No mock product catalogs, fake APIs, or in-memory stand-ins for inventory/orders.

## Stack

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Frontend | React 19, React Router, Vite, **Tailwind CSS v4** |
| Backend  | Express 5, better-sqlite3     |
| Data     | SQLite file at `server/data/` |

## Quick start

```bash
# From repo root
npm install
npm install --prefix server
npm install --prefix client

# Run API (http://localhost:3001) + Vite (http://localhost:5173)
npm run dev
```

- **Storefront:** http://localhost:5173  
- **API health:** http://localhost:3001/api/health  

The API auto-seeds the database on first boot if it is empty.

## API

| Method | Path                         | Description                |
| ------ | ---------------------------- | -------------------------- |
| GET    | `/api/health`                | Health + DB stats          |
| GET    | `/api/products`              | List products (filters)    |
| GET    | `/api/products/:idOrSlug`    | Product detail             |
| GET    | `/api/categories`            | Categories                 |
| POST   | `/api/orders`                | Create order (updates stock) |
| GET    | `/api/orders/:orderNumber`   | Fetch order                |
| POST   | `/api/contact`               | Persist contact message    |

Query params for products: `category`, `featured`, `q`, `inStock`.

## Scripts

```bash
npm run dev          # client + server
npm run dev:server   # API only
npm run dev:client   # Vite only
npm run seed         # seed if empty
cd server && npm run db:reset   # wipe DB and reseed
```

## Stripe payments + address autocomplete

Checkout uses **Stripe Payment Element** and **Address Element** (street autocomplete). Amounts are priced on the server from SQLite; orders are created only after a **succeeded** PaymentIntent is verified.

### Local setup (Stripe CLI)

Your CLI is already linked to the Vantryl Stripe account. Keys are loaded into `server/.env` (gitignored):

```bash
# Sync keys from Stripe CLI → server/.env
bash scripts/sync-stripe-env.sh

# API + Vite
npm run dev

# In another terminal — forward webhooks (optional but recommended)
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Copy the whsec_… secret into server/.env as STRIPE_WEBHOOK_SECRET, then restart the API
```

**Test card:** `4242 4242 4242 4242` · any future expiry · any CVC · any ZIP

### Live mode

Stripe CLI currently has **test** keys only (`sk_test_…`). To charge real cards:

1. Complete Stripe account activation in the Dashboard  
2. `stripe login` and ensure live keys appear in `stripe config --list`  
3. Re-run `bash scripts/sync-stripe-env.sh` (prefers live keys when present)  
4. Redeploy Cloud Run with live secrets  

### API

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/api/payments/config` | Publishable key + liveMode flag |
| POST | `/api/payments/create-intent` | Create PaymentIntent from cart |
| POST | `/api/orders` | Verify PI + save paid order |
| POST | `/api/webhooks/stripe` | Stripe webhooks |

## Deploy to Google Cloud (Cloud Run)

Single container serves the React build + Express API. SQLite lives at `/tmp` (ephemeral per instance; re-seeds on cold start if empty).

```bash
# Enable APIs (once)
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Deploy from source (Cloud Build builds the Dockerfile)
gcloud run deploy superset \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars NODE_ENV=production,DB_PATH=/tmp/superset-data/superset.db
```

Or use `cloudbuild.yaml` after creating an Artifact Registry repo named `superset`.

## Project skill

See `.grok/skills/real-backend/SKILL.md` — agents working in this repo must use the real backend, never mock data.
