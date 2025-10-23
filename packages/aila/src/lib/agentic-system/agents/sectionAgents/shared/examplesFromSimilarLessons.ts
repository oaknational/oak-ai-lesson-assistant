export const decorateExample =
  <T>(extractFn: (lesson: T) => string | null) =>
  (lesson: T, i: number, targetKey: string) =>
    `<example-${targetKey}-${i}>\n${extractFn(lesson)}\n</example-${targetKey}-${i}>`;

export const examplesFromSimilarLessons = <T>(
  lessons: T[],
  targetKey: string,
  extractRagDataAsText: (lesson: T) => string | null,
) => {
  const examples = lessons.filter(extractRagDataAsText);

  if (!examples.length) {
    return `No relevant examples found.`;
  }

  const decorateFn = decorateExample(extractRagDataAsText);

  return examples
    .map((lesson, i) => decorateFn(lesson, i, targetKey))
    .join("\n\n");
};
