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

export function parseSubjects(subject: string): string[] {
  return subjectMap[subject] ?? [subject];
}
