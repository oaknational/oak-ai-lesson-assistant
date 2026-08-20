import { z } from "zod";

import type { Cycle } from "../../../../../protocol/schema";

/**
 * The stimulus types a practice task may include. Single source of truth for
 * the cycle prompt and the pointer sentence shown on slides, so the label the
 * model picks and the sentence pupils read can never disagree.
 */
export const STIMULUS_TYPES = [
  "text extract",
  "data table",
  "statements to sort",
  "sentences to complete",
  "calculations",
] as const;

export type StimulusType = (typeof STIMULUS_TYPES)[number];

export const PracticeTaskPartsSchema = z.object({
  instruction: z.string()
    .describe(`The first line of the task: a clear instruction starting with a phase-appropriate command word.
May be followed by numbered sub-questions (1. 2. 3.), each on its own line, that require pupils to think progressively more deeply.
No orientation steps, stimulus material or scaffolding here.
Written in the TEACHER_TO_PUPIL_WRITTEN voice.`),
  chunking: z.array(z.string())
    .describe(`Smaller sequential steps that break one activity down to support cognitive load.
One short step per line. Do not include bullet markers; steps are rendered as bullet points automatically.
Use an empty array when the task needs no steps.`),
  stimulus: z
    .object({
      label: z
        .enum(STIMULUS_TYPES)
        .describe(
          "The type of stimulus. Used to direct pupils to the worksheet when the stimulus cannot fit on the slide.",
        ),
      content: z
        .string()
        .describe(
          "The stimulus material itself that pupils work from, e.g. the rows of a data table or the text extract. No bullet points.",
        ),
    })
    .nullable()
    .describe("Material the pupil works from. Null when not needed."),
  scaffolding: z
    .string()
    .nullable()
    .describe(
      `Optional support included at the end of the task, e.g. a word bank: "Use these words: rate, reactant, used up." No bullet points. Null when not needed.`,
    ),
});

export type PracticeTaskParts = z.infer<typeof PracticeTaskPartsSchema>;

/**
 * Slide rendering constraints. The practice task slide is a fixed-size box:
 * text that does not fit is silently clipped by Google Slides, so the slide
 * version is trimmed to this budget. Lines longer than WORDS_PER_LINE wrap
 * and count as two.
 */
export const MAX_SLIDE_LINES = 12;
export const WORDS_PER_LINE = 12;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimates rendered slide lines: blank lines count as one, long lines wrap. */
export function estimateRenderedLines(text: string): number {
  return text
    .split("\n")
    .reduce(
      (total, line) =>
        total + Math.max(1, Math.ceil(wordCount(line) / WORDS_PER_LINE)),
      0,
    );
}

function renderBlocks(blocks: (string | undefined)[]): string {
  return blocks
    .map((block) => block?.trim())
    .filter((block): block is string => Boolean(block))
    .join("\n\n");
}

/**
 * Composes the two stored renderings of a practice task from its parts.
 *
 * `practice` is the full task (lesson plan and worksheet, no length limit).
 * `practiceSlideText` is the slide version: parts are dropped in a fixed
 * ladder until the task fits the slide box, each dropped part replaced by a
 * pointer to the worksheet, which always carries the full task. Omitted when
 * the full task already fits.
 */
export function composePracticeTask(parts: PracticeTaskParts): {
  practice: string;
  practiceSlideText?: string;
} {
  const { instruction, chunking, stimulus, scaffolding } = parts;
  const chunkingBlock =
    chunking.length > 0
      ? chunking.map((step) => `- ${step.trim()}`).join("\n")
      : undefined;
  const stimulusPointer = stimulus
    ? `You will find the ${stimulus.label} on the worksheet.`
    : undefined;
  const stepsPointer =
    chunkingBlock !== undefined
      ? "You will find the steps on the worksheet."
      : undefined;

  const practice = renderBlocks([
    instruction,
    chunkingBlock,
    stimulus?.content,
    scaffolding ?? undefined,
  ]);

  // The trim ladder: full task, then stimulus swapped for its pointer, then
  // scaffolding dropped, then chunking swapped for its pointer. The
  // instruction is never dropped; if even the last stage is over budget it is
  // used anyway (the scorer flags it).
  const candidates = [
    practice,
    renderBlocks([
      instruction,
      chunkingBlock,
      stimulusPointer,
      scaffolding ?? undefined,
    ]),
    renderBlocks([instruction, chunkingBlock, stimulusPointer]),
    renderBlocks([instruction, stepsPointer, stimulusPointer]),
  ];

  const slide =
    candidates.find(
      (candidate) => estimateRenderedLines(candidate) <= MAX_SLIDE_LINES,
    ) ?? candidates[candidates.length - 1];

  return slide === practice || slide === undefined
    ? { practice }
    : { practice, practiceSlideText: slide };
}

/** Maps the cycle agent's parts-shaped response to the document's cycle shape. */
export function composeCycleFromResponse<
  T extends { practice: PracticeTaskParts },
>(
  response: T,
): Omit<T, "practice"> &
  Pick<Cycle, "practice"> & { practiceSlideText?: string } {
  const { practice, practiceSlideText } = composePracticeTask(
    response.practice,
  );
  // Omit the key entirely when the full task fits, rather than storing undefined.
  return practiceSlideText === undefined
    ? { ...response, practice }
    : { ...response, practice, practiceSlideText };
}
