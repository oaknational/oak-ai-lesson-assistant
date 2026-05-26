# Schema additions

This directory houses SQL additions to the Prisma schema where the Prisma schema is not expressive enough to capture the desired schema (e.g. ivfflat indexes, partial unique indexes).

These are applied automatically via:

- **Migrations** (`prisma migrate deploy`) — see `20260319165220_apply_rag_additions`
- **db-push** (`pnpm db-push`) — runs all `*.sql` files in this folder after push

When adding a new file here, also create a corresponding migration.
