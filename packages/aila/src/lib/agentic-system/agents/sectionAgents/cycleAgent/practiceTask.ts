import { z } from "zod";

import type { Cycle } from "../../../../../protocol/schema";

/**
 * The stimulus types a practice task may include. Single source of truth for
 * the cycle prompt and the pointer sentences shown on slides, so the label the
 * model picks and the sentence pupils read can never disagree.
 */
export const STIMULUS_TYPES = [
  "text extract",
  "data table",
  "items to sort",
  "sentences to complete",
  "calculations",
] as const;

export type StimulusType = (typeof STIMULUS_TYPES)[number];

const StimulusSchema = z.object({
  label: z
    .enum(STIMULUS_TYPES)
    .describe(
      "The type of stimulus. Used to direct pupils to it when it cannot fit on the task slide.",
    ),
  content: z
    .string()
    .describe(
      "The stimulus material itself that pupils work from, e.g. the rows of a data table or the text extract. No bullet points and no numbers. Never refer to it by position (below, above); refer to it by name.",
    ),
});

export type Stimulus = z.infer<typeof StimulusSchema>;

export const PracticeTaskPartsSchema = z.object({
  instruction: z.string()
    .describe(`The un-numbered TASK INSTRUCTION: the first line of the task, a single clear sentence telling pupils what to produce now.
Must start with a command word that is phase-appropriate and matched to the cognitive demand of the work pupils actually do.
Do not restate the learning cycle outcome, add orientation steps, or include superfluous information.`),
  statements: z.array(
    z.object({
      text: z.string()
        .describe(`One numbered STATEMENT that chunks up the main task. An imperative starting with a command word matched to its own cognitive demand.
Do not include the number; numbering is added automatically. One short line (about 12 words or fewer).
A statement that introduces its own stimulus should end with a colon.`),
      stimulus: StimulusSchema.nullable().describe(
        "The stimulus this statement works from, shown directly beneath it. Null when the statement needs none.",
      ),
    }),
  )
    .describe(`The numbered STATEMENTS, in order, requiring progressively deeper thinking.
Only include statements when the task genuinely has multiple steps; use an empty array for one continuous activity.`),
  sharedStimulus: StimulusSchema.nullable()
    .describe(`A single STIMULUS that applies to all statements (e.g. a passage every statement works from), shown after the statements.
Null when there is none. A task should use either per-statement stimuli or this shared stimulus, not both.`),
});

export type PracticeTaskParts = z.infer<typeof PracticeTaskPartsSchema>;

/**
 * Slide rendering constraints. The practice task slide and the stimulus slide
 * are fixed-size boxes: text that does not fit is silently clipped by Google
 * Slides, so slide versions are trimmed to this budget. Lines longer than
 * WORDS_PER_LINE wrap and count as two.
 */
export const MAX_SLIDE_LINES = 12;
export const WORDS_PER_LINE = 12;

/** Where trimmed material is sent; the wording pupils read on the slide. */
type PointerDestination = "next slide" | "worksheet";

export function stimulusPointerLine(
  label: string,
  destination: PointerDestination,
): string {
  return `You will find the ${label} on the ${destination}.`;
}

export const STEPS_POINTER_LINE = "You will find the steps on the worksheet.";

/** Heading attributing a moved stimulus to its statement on the stimulus slide. */
export function stimulusHeadingLine(statementNumber: number): string {
  return `For step ${statementNumber}:`;
}

const SHARED_STIMULUS_HEADING = "For all steps:";

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

/** Joins non-empty segments with a blank separator line. */
function renderSegments(segments: (string | undefined)[]): string {
  return segments
    .map((segment) => segment?.trim())
    .filter((segment): segment is string => Boolean(segment))
    .join("\n\n");
}

// A statement's stimulus is keyed by its index; the shared stimulus by "shared".
type StimulusKey = number | "shared";

/**
 * Renders the task with the given stimuli replaced by pointer lines. The
 * segment structure mirrors the prompt's examples: consecutive stimulus-less
 * statements sit on adjacent lines; a stimulus (or its pointer) is a
 * blank-separated block directly beneath its statement; the shared stimulus
 * follows the statements.
 */
function renderTask(
  parts: PracticeTaskParts,
  moved: Set<StimulusKey>,
  destination: PointerDestination,
): string {
  const segments: (string | undefined)[] = [parts.instruction];
  let statementRun: string[] = [];

  const flushRun = () => {
    if (statementRun.length > 0) {
      segments.push(statementRun.join("\n"));
      statementRun = [];
    }
  };

  parts.statements.forEach((statement, index) => {
    statementRun.push(`${index + 1}. ${statement.text.trim()}`);
    if (statement.stimulus) {
      flushRun();
      segments.push(
        moved.has(index)
          ? stimulusPointerLine(statement.stimulus.label, destination)
          : statement.stimulus.content,
      );
    }
  });
  flushRun();

  if (parts.sharedStimulus) {
    segments.push(
      moved.has("shared")
        ? stimulusPointerLine(parts.sharedStimulus.label, destination)
        : parts.sharedStimulus.content,
    );
  }

  return renderSegments(segments);
}

/** Renders the stimulus slide: moved stimuli in statement order, each attributed. */
function renderStimulusSlide(
  parts: PracticeTaskParts,
  moved: Set<StimulusKey>,
): string {
  const segments: string[] = [];
  parts.statements.forEach((statement, index) => {
    if (statement.stimulus && moved.has(index)) {
      segments.push(
        `${stimulusHeadingLine(index + 1)}\n${statement.stimulus.content.trim()}`,
      );
    }
  });
  if (parts.sharedStimulus && moved.has("shared")) {
    // A heading is only needed to disambiguate from per-statement stimuli.
    const heading = moved.size > 1 ? `${SHARED_STIMULUS_HEADING}\n` : "";
    segments.push(`${heading}${parts.sharedStimulus.content.trim()}`);
  }
  return renderSegments(segments);
}

const fits = (text: string) => estimateRenderedLines(text) <= MAX_SLIDE_LINES;

/**
 * Composes the stored renderings of a practice task from its parts.
 *
 * `practice` is the full task (lesson plan and worksheet, no length limit).
 * The slide versions follow a two-tier ladder:
 *   1. the full task fits the task slide: no slide fields at all;
 *   2. stimuli are moved to the stimulus slide, largest first, until the task
 *      fits, each replaced by a "next slide" pointer;
 *   3. if the moved stimuli overflow the stimulus slide too, they all go to
 *      the worksheet instead (one destination per task, never split);
 *   4. if the instruction and statements alone overflow, the statements are
 *      replaced by a worksheet pointer. The instruction is never dropped.
 */
export function composePracticeTask(parts: PracticeTaskParts): {
  practice: string;
  practiceSlideText?: string;
  practiceStimulusSlideText?: string;
} {
  const practice = renderTask(parts, new Set(), "worksheet");
  if (fits(practice)) {
    return { practice };
  }

  // Movable stimuli, largest first; ties keep statement order, shared last.
  const movable: { key: StimulusKey; size: number }[] = [
    ...parts.statements.flatMap((statement, index) =>
      statement.stimulus
        ? [
            {
              key: index as StimulusKey,
              size: estimateRenderedLines(statement.stimulus.content),
            },
          ]
        : [],
    ),
    ...(parts.sharedStimulus
      ? [
          {
            key: "shared" as StimulusKey,
            size: estimateRenderedLines(parts.sharedStimulus.content),
          },
        ]
      : []),
  ].sort((a, b) => b.size - a.size);

  const moved = new Set<StimulusKey>();
  let taskSlide = practice;
  for (const stimulus of movable) {
    moved.add(stimulus.key);
    taskSlide = renderTask(parts, moved, "next slide");
    if (fits(taskSlide)) break;
  }

  if (!fits(taskSlide)) {
    // The instruction and statements alone overflow. Replace the statements
    // (and everything under them) with the worksheet pointer; with no
    // statements there is nothing left to drop, so overflow stands and the
    // cycle-slide-lines scorer flags it.
    const lastResort =
      parts.statements.length > 0
        ? renderSegments([parts.instruction, STEPS_POINTER_LINE])
        : renderTask(parts, moved, "worksheet");
    return { practice, practiceSlideText: lastResort };
  }

  const stimulusSlide = renderStimulusSlide(parts, moved);
  if (fits(stimulusSlide)) {
    return {
      practice,
      practiceSlideText: taskSlide,
      practiceStimulusSlideText: stimulusSlide,
    };
  }

  // The moved stimuli do not fit their own slide: send them all to the
  // worksheet instead, one destination per task.
  return { practice, practiceSlideText: renderTask(parts, moved, "worksheet") };
}

/** Maps the cycle agent's parts-shaped response to the document's cycle shape. */
export function composeCycleFromResponse<
  T extends { practice: PracticeTaskParts },
>(
  response: T,
): Omit<T, "practice"> &
  Pick<Cycle, "practice"> & {
    practiceSlideText?: string;
    practiceStimulusSlideText?: string;
  } {
  const { practice, practiceSlideText, practiceStimulusSlideText } =
    composePracticeTask(response.practice);
  // Absent keys, not undefined values: absence of the stimulus-slide text is
  // what tells the export to delete that cycle's stimulus slide.
  return {
    ...response,
    practice,
    ...(practiceSlideText !== undefined && { practiceSlideText }),
    ...(practiceStimulusSlideText !== undefined && {
      practiceStimulusSlideText,
    }),
  };
}
