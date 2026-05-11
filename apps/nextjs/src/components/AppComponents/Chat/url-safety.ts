const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function sanitiseUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return SAFE_URL_PROTOCOLS.has(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
