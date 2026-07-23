# Instagram Tracker MVP

A minimal Instagram analytics tracker built with React, Vite, Tailwind CSS, Cloudflare Workers, and Supabase PostgreSQL.

## Project structure

- `frontend/` — React + Vite UI
- `worker/` — Cloudflare Worker API, scheduled collection, mock collector abstraction
- `database/` — Supabase SQL schema and setup notes

## Setup

1. Copy `.env.example` to `.env` in the repository root.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Set `CF_ACCOUNT_ID` and optional Cloudflare environment variables.

## Development

### Install dependencies

In the repository root:

```bash
npm install
```

Then start the frontend:

```bash
npm --prefix frontend run dev
```

Run the worker locally with Wrangler:

```bash
npm --prefix worker run dev
```

## Database migration

Apply `worker/src/database/schema.sql` in Supabase SQL editor or via `psql`.

## Notes

- The backend uses a modular collector interface with a `MockCollector` implementation.
- Real Instagram data sources should be added by implementing `MetaCollector` or `PublicDataCollector`.
- The Worker routes are protected with a simple `x-api-key` header for write operations.

## Where to add Supabase credentials

Add your Supabase settings to `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The worker reads those values via environment variables and never exposes the service role key to the frontend.
