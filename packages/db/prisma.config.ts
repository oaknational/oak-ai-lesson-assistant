import { defineConfig } from "prisma/config";

/**
 * Config for the Prisma CLI. The running app connects in client/index.ts.
 *
 * Environment variables come from the `with-env` script or Doppler, so this
 * file doesn't load .env itself. The URL is optional so that `prisma generate`
 * works in CI without database credentials.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL,
  },
});
