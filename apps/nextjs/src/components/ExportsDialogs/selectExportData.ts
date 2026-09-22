/** Keep a valid preloaded export, but let a generated result replace a preload error. */
export function selectExportData<T extends object>(
  preloaded: T | null | undefined,
  generated: T | null | undefined,
): T | undefined {
  if (preloaded && "link" in preloaded && typeof preloaded.link === "string") {
    return preloaded;
  }
  return generated ?? preloaded ?? undefined;
}
