export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9 _-]/g, "").trim();
}

export function truncateFilename(filename: string, maxLength = 50): string {
  if (filename.length <= maxLength) {
    return filename;
  }
  const truncated = filename.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > maxLength / 2 ? truncated.slice(0, lastSpace) : truncated;
}
