import { textify } from "@oakai/core/src/utils/textify";

import type { PartialLessonPlan } from "../../../protocol/schema";

export type MeaningOccurrence = { section: string; snippet: string };
export type MeaningEntry = {
  occurrences: MeaningOccurrence[];
  meaning: string;
};

export function extractAmericanMeaning(
  details: Record<string, string>,
): string {
  return details["American English"] ?? "";
}

export function extractSnippet(text: string, phrase: string): string {
  const pattern = new RegExp(
    String.raw`[^.!?\n]*\b${phrase}\b[^.!?\n]*[.!?]?`,
    "i",
  );
  const match = pattern.exec(text);
  return match ? match[0].trim() : "";
}

export function collectMeaningOccurrences(
  issues: Array<{
    section: string;
    phrase: string;
    details: Record<string, string>;
  }>,
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
