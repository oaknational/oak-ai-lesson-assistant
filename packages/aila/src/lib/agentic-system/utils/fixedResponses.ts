export function displayRelevantLessons(
  relevantLessons: { title: string }[],
): string {
  return `I have fetched the following existing Oak lessons that look relevant:
${relevantLessons.map((lesson, i) => `${i + 1}. ${lesson.title}`).join("\n")}
Would you like to base your lesson on one of these? Otherwise we can create one from scratch!`;
}

export function genericErrorMessage(): string {
  return "We encountered an error while processing your request.";
}
