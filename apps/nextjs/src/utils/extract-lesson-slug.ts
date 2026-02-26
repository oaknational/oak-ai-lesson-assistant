export const extractLessonSlugFromInput = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/\/+$/, "");
  const match = normalized.match(/\/lessons\/([^/?#]+)/);

  if (match?.[1]) {
    return match[1];
  }

  return normalized;
};
