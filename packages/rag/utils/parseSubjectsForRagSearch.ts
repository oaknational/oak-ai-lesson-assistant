import { slugify } from "@oakai/core/src/utils/slugify";

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
  // Slugify so callers passing "Science" or "Combined Science" still match
  // the slug keys.
  const key = slugify(subject);
  return subjectMap[key] ?? [key];
}
