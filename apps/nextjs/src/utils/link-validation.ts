export function containsLink(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const matches = text.match(urlRegex) ?? [];

  return matches.some((match) => {
    try {
      new URL(match.startsWith("www.") ? `https://${match}` : match);
      return true;
    } catch {
      return false;
    }
  });
}
