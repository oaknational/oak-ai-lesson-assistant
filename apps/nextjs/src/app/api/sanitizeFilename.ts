export function sanitizeFilename(filename: string): string {
  // Allow only alphanumeric characters, spaces, hyphens, and underscores
  return filename.replace(/[^a-zA-Z0-9 _-]/g, "");
}
