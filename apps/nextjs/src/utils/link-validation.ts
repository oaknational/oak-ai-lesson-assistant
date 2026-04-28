export function containsLink(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) ?? [];

  return urls.some((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}
