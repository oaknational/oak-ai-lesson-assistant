export const extractLessonSlugFromInput = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/\/+$/, "");
  const lessonsPath = "/lessons/";
  const lessonsIndex = normalized.indexOf(lessonsPath);

  if (lessonsIndex === -1) {
    return normalized;
  }

  const slugStart = lessonsIndex + lessonsPath.length;
  const remainder = normalized.slice(slugStart);

  if (!remainder) return null;

  const stopChars = ["/", "?", "#"];
  const stopIndex = stopChars.reduce((currentMin, char) => {
    const index = remainder.indexOf(char);
    if (index === -1) return currentMin;
    return currentMin === -1 ? index : Math.min(currentMin, index);
  }, -1);

  return stopIndex === -1 ? remainder : remainder.slice(0, stopIndex);
};
