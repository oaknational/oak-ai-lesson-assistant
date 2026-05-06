import { textify } from "@oakai/core/src/utils/textify";

import type { AmericanismIssue } from "../../../features/americanisms";
import type { PartialLessonPlan } from "../../../protocol/schema";

type MeaningOccurrence = { section: string; snippet: string };
export type MeaningEntry = {
  occurrences: MeaningOccurrence[];
  meaning: string;
};

type MeaningIssue = Extract<AmericanismIssue, { issue: "Different meanings" }>;
type MeaningIssueWithSection = MeaningIssue & { section: string };

export function extractAmericanMeaning(
  details: Record<string, string>,
): string {
  return details["American English"] ?? "";
}

export function extractSnippet(text: string, phrase: string): string {
  const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    String.raw`[^.!?\n]*(?<!\w)${escapedPhrase}(?!\w)[^.!?\n]*[.!?]?`,
    "i",
  );
  const match = pattern.exec(text);
  return match ? match[0].trim() : "";
}

export function collectMeaningOccurrences(
  issues: MeaningIssueWithSection[],
  finalDocument: PartialLessonPlan,
): Map<string, MeaningEntry> {
  const byPhrase = new Map<string, MeaningEntry>();
  for (const { section, phrase, details } of issues) {
    const sectionText = textify(
      finalDocument[section as keyof typeof finalDocument],
    );
    const snippet = extractSnippet(sectionText, phrase);
    const entry = byPhrase.get(phrase);
    if (entry) {
      entry.occurrences.push({ section, snippet });
      if (!entry.meaning) entry.meaning = extractAmericanMeaning(details);
    } else {
      byPhrase.set(phrase, {
        occurrences: [{ section, snippet }],
        meaning: extractAmericanMeaning(details),
      });
    }
  }
  return byPhrase;
}

export function formatMeaningEvidence(
  byPhrase: Map<string, MeaningEntry>,
): string {
  const lines: string[] = [];
  for (const [phrase, { occurrences, meaning }] of byPhrase) {
    const sections = occurrences.map((o) => o.section);
    lines.push(`- "${phrase}" [${sections.join(", ")}]`);
    if (meaning) lines.push(`  US: ${meaning.replaceAll("\n", " ").trim()}`);
    const seen = new Set<string>();
    for (const { section, snippet } of occurrences) {
      if (snippet && !seen.has(snippet)) {
        seen.add(snippet);
        lines.push(`  ${section}: "...${snippet}..."`);
      }
    }
  }
  return lines.join("\n");
}
