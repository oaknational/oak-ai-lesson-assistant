// Type guard to check if the value is a plain object

export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
