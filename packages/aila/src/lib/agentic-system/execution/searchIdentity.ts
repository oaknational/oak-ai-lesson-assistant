import { parseKeyStage } from "@oakai/core/src/data/parseKeyStage";
import { slugify } from "@oakai/core/src/utils/slugify";

import type { SearchIdentity } from "../../../protocol/schema";

export type { SearchIdentity };

const SUBJECT_SYNONYMS: Record<string, string> = {
  mathematics: "maths",
  math: "maths",
  bio: "biology",
  chem: "chemistry",
  phys: "physics",
  pe: "physical-education",
  dt: "design-technology",
  "design-and-technology": "design-technology",
  "computer-science": "computing",
  cs: "computing",
  "comp-sci": "computing",
  re: "religious-education",
  rs: "religious-education",
  "religious-studies": "religious-education",
  religion: "religious-education",
  geo: "geography",
  geog: "geography",
  hist: "history",
  eng: "english",
  sci: "science",
  "double-science": "combined-science",
  "dual-science": "combined-science",
  pshe: "rshe-pshe",
  rshe: "rshe-pshe",
  "art-and-design": "art",
};

function canonicaliseSubject(raw: string): string {
  const slug = slugify(raw);
  return SUBJECT_SYNONYMS[slug] ?? slug;
}

const TITLE_JACCARD_THRESHOLD = 0.7;

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "and",
  "or",
  "for",
  "is",
  "it",
  "at",
  "by",
  "lesson",
  "introduction",
  "introducing",
  "overview",
  "about",
  "exploring",
  "understanding",
  "basics",
  "basic",
  "advanced",
]);

function stem(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("ves") && word.length > 4) return word.slice(0, -3) + "f";
  if (word.endsWith("ses") || word.endsWith("zes") || word.endsWith("xes"))
    return word.slice(0, -2);
  if (word.endsWith("ing") && word.length > 5) {
    const base = word.slice(0, -3);
    if (base.at(-1) === base.at(-2)) return base.slice(0, -1);
    return base;
  }
  if (word.endsWith("ise")) return word.slice(0, -3);
  if (word.endsWith("ize")) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) {
    const base = word.slice(0, -2);
    if (base.at(-1) === base.at(-2)) return base.slice(0, -1);
    return base;
  }
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3)
    return word.slice(0, -1);
  return word;
}

function tokenise(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
    .map(stem);
  return new Set(tokens);
}

function titleJaccard(a: string, b: string): number {
  const setA = tokenise(a);
  const setB = tokenise(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersection / union;
}

export function hasSearchIdentityChangedSignificantly(
  prev: SearchIdentity | null | undefined,
  next: SearchIdentity,
): boolean {
  if (!prev) return true;

  if (parseKeyStage(prev.keyStage) !== parseKeyStage(next.keyStage))
    return true;

  if (canonicaliseSubject(prev.subject) !== canonicaliseSubject(next.subject))
    return true;

  return titleJaccard(prev.title, next.title) < TITLE_JACCARD_THRESHOLD;
}
