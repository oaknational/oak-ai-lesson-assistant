export function getExternalFacingUrl() {
  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl?.includes("production")) {
    return "labs.thenational.academy";
  }

  return vercelUrl;
}
