const subjectMap: Record<string, string[]> = {
  science: ["biology", "chemistry", "physics", "science", "combined-science"],
  biology: ["biology", "science", "combined-science"],
  chemistry: ["chemistry", "science", "combined-science"],
  physics: ["physics", "science", "combined-science"],
  "combined-science": [
    "combined-science",
    "science",
    "biology",
    "chemistry",
    "physics",
  ],
};

export function parseSubjectsForRagSearch(subject: string): string[] {
  // Lowercase so callers passing "Science" still match the lowercase keys.
  const key = subject.toLowerCase();
  return subjectMap[key] ?? [key];
}
