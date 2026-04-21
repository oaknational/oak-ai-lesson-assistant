const SAFE_URL_PROTOCOLS = ["http:", "https:", "mailto:"];

export function sanitiseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
