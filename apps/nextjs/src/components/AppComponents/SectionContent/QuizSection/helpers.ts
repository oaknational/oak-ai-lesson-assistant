export const ensureEndsWithPeriod = (text: string): string => {
  const trimmed = text.trim();

  // Check if it ends with a markdown image
  if (trimmed.match(/!\[.*?\]\(.*?\)$/)) {
    return trimmed;
  }

  // Check if it already ends with punctuation
  if (trimmed.match(/[.!?]$/)) {
    return trimmed;
  }

  return trimmed + ".";
};

export const addInstruction = (
  question: string,
  instruction: string,
): string => {
  return `${ensureEndsWithPeriod(question)} ${instruction}`;
};
