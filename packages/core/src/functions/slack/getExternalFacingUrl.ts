export function getExternalFacingUrl() {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (vercelEnv === "production") {
    return vercelProductionUrl;
  }

  return vercelUrl;
}
