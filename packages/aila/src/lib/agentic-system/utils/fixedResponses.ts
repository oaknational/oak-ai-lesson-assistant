export function displayRelevantLessons(
  relevantLessons: { title: string }[],
): string {
  const list = relevantLessons
    .map((lesson, i) => `${i + 1}. ${lesson.title}`)
    .join("\n");
  return `I have fetched the following existing Oak lessons that look relevant:\n\n${list}\n\nWould you like to base your lesson on one of these? Otherwise we can create one from scratch!`;
}

export function hardFailureMessage(): string {
  return "I wasn't able to complete that lesson update. Please try again.";
}

export function messageToUserFallbackMessage(): string {
  return "The lesson plan has been updated, but the usual summary wasn't available. Please review the changes and let me know what you'd like to adjust next.";
}
