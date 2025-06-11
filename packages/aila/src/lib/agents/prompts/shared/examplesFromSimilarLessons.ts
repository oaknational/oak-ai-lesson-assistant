export const examplesFromSimilarLessons = <T>(
  lessons: T[],
  targetKey: string,
  extractRagDataAsText: (lesson: T) => string,
) =>
  lessons
    .map(
      (lesson, i) =>
        `<example-${targetKey}-${i}>\n${extractRagDataAsText(lesson)}\n</example-${targetKey}-${i}>`,
    )
    .join("\n\n");
