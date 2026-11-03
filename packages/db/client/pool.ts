import { waitUntil } from "@vercel/functions";
import { Pool } from "pg";

// Prisma 6 gave up on a new connection after 5 seconds. pg waits forever by default.
export const CONNECTION_TIMEOUT_MS = 5_000;

// Per function instance. ScaleGrid's PgBouncer runs in session mode, so each
// open connection holds one of its server connections until it's idle.
export const MAX_CONNECTIONS = 5;

// pg's default, set explicitly because keepAliveUntilIdle depends on it
export const IDLE_TIMEOUT_MS = 10_000;

// Settings in the URL override ones passed to pg, so these would replace the CA.
const URL_SSL_PARAMS = [
  "sslmode",
  "sslrootcert",
  "sslcert",
  "sslkey",
  "uselibpqcompat",
];

/**
 * Environments whose server certificate isn't signed by a public CA set
 * DATABASE_CA_CERT to the PEM text of the CA that signed it.
 */
export const createPoolConfig = (connectionString?: string, ca?: string) => {
  const limits = {
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: IDLE_TIMEOUT_MS,
    max: MAX_CONNECTIONS,
  };
  if (!connectionString || !ca) {
    return { connectionString, ...limits };
  }

  const url = new URL(connectionString);
  for (const param of URL_SSL_PARAMS) {
    url.searchParams.delete(param);
  }
  return { connectionString: url.toString(), ...limits, ssl: { ca } };
};

/**
 * With Vercel Fluid compute, keeps the instance alive until its connections
 * have been idle long enough for pg to close them, so a suspended instance
 * doesn't hold on to PgBouncer's server connections.
 *
 * This does what attachDatabasePool from @vercel/functions does, without its
 * log line for every query whenever DEBUG is set.
 */
export const keepAliveUntilIdle = (
  pool: { on(event: "release", listener: () => void): unknown },
  keepAlive: (promise: Promise<void>) => void = waitUntil,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let resolvePrevious = () => {};
  pool.on("release", () => {
    clearTimeout(timer);
    resolvePrevious();
    keepAlive(
      new Promise<void>((resolve) => {
        resolvePrevious = resolve;
        timer = setTimeout(resolve, IDLE_TIMEOUT_MS + 100);
      }),
    );
  });
};

export const createPool = () => {
  const pool = new Pool(
    createPoolConfig(process.env.DATABASE_URL, process.env.DATABASE_CA_CERT),
  );
  if (process.env.VERCEL) {
    keepAliveUntilIdle(pool);
  }
  return pool;
};
