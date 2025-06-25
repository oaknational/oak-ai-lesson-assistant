export const examplesFromSimilarLessons = <T>(
  lessons: T[],
  targetKey: string,
  extractRagDataAsText: (lesson: T) => string | null,
) => {
  const examples = lessons.filter(extractRagDataAsText);

  if (!examples.length) {
    return `No relevant examples found.`;
  }

  return examples
    .map(
      (lesson, i) =>
        `<example-${targetKey}-${i}>\n${extractRagDataAsText(lesson)}\n</example-${targetKey}-${i}>`,
    )
    .join("\n\n");
};
