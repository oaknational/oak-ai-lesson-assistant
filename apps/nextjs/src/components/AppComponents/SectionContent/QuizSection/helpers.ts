export const ensureEndsWithPeriod = (text: string): string => {
  return text.endsWith(".") ? text : text + ".";
};

export const addInstruction = (
  question: string,
  instruction: string,
): string => {
  return `${ensureEndsWithPeriod(question)} ${instruction}`;
};
