/**
 * Extracts the file ID from a Google Drive URL
 * @param url - Google Drive URL
 * @returns File ID
 */
export default function extractFileIdFromUrl(url: string): string {
  // Match various Google Drive URL formats:
  // https://docs.google.com/presentation/d/{id}/edit
  // https://drive.google.com/file/d/{id}/view
  // https://drive.google.com/open?id={id}
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  // If no pattern matches, throw an error
  throw new Error(`Invalid Google Drive URL format: ${url}`);
}
