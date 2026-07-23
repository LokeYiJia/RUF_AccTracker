# Database setup

This project uses Supabase PostgreSQL for data storage.

## Tables

- `accounts`
- `account_snapshots`
- `posts`
- `post_snapshots`
- `collection_runs`

## Migration

Use the SQL in `worker/src/database/schema.sql` to create the database schema in Supabase.

## Environment

Add your Supabase settings to `.env` or your environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit your service role key.
