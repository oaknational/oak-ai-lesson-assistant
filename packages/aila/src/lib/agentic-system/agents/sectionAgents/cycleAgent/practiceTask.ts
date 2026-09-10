import { z } from "zod";

import type { Cycle } from "../../../../../protocol/schema";
import { type FeedbackPieces, composeFeedback } from "./feedback";

/**
 * The kinds of material a practice task can include. Both the prompt and the
 * pointer sentences on slides use this list, so the label the model picks
 * always matches the words pupils read.
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
    .describe(`A single STIMULUS that applies to all statements (e.g. a passage every statement works from), shown above the statements, directly after the task instruction.
Null when there is none. A task should use either per-statement stimuli or this shared stimulus, not both.`),
});

export type PracticeTaskParts = z.infer<typeof PracticeTaskPartsSchema>;

/**
 * How much text fits on a slide. The text boxes are a fixed size and Google
 * Slides cuts off anything that does not fit, with no warning, so the slide
 * versions are trimmed to this budget. A line longer than WORDS_PER_LINE
 * words wraps and counts as more than one line.
 */
export const MAX_SLIDE_LINES = 12;
export const WORDS_PER_LINE = 12;

/** Where moved material ends up: the exact word pupils read in the pointer sentence. */
type PointerDestination = "next slide" | "worksheet";

export function stimulusPointerLine(
  label: string,
  destination: PointerDestination,
): string {
  return `You will find the ${label} on the ${destination}.`;
}

export const STEPS_POINTER_LINE = "You will find the steps on the worksheet.";

/** Heading on the stimulus slide saying which statement the material belongs to. */
function stimulusHeadingLine(statementNumber: number): string {
  return `For step ${statementNumber}:`;
}

const SHARED_STIMULUS_HEADING = "For all steps:";

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
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
function renderSegments(segments: string[]): string {
  return segments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("\n\n");
}

// Names a stimulus: the index of its statement, or "shared" for the shared one.
type StimulusKey = number | "shared";

/**
 * Renders the task, swapping each moved stimulus for a pointer line. The
 * layout follows the prompt's examples: statements without a stimulus sit on
 * adjacent lines; a stimulus (or its pointer) is its own block directly under
 * its statement; a shared stimulus goes above the statements, straight after
 * the instruction.
 */
function renderTask(
  parts: PracticeTaskParts,
  moved: Set<StimulusKey>,
  destination: PointerDestination,
): string {
  const segments: string[] = [parts.instruction];

  if (parts.sharedStimulus) {
    segments.push(
      moved.has("shared")
        ? stimulusPointerLine(parts.sharedStimulus.label, destination)
        : parts.sharedStimulus.content,
    );
  }

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

  return renderSegments(segments);
}

/** Renders the stimulus slide: moved material in statement order, each under its heading. */
function renderStimulusSlide(
  parts: PracticeTaskParts,
  moved: Set<StimulusKey>,
): string {
  const segments: string[] = [];
  if (parts.sharedStimulus && moved.has("shared")) {
    // The heading is only needed when per-statement material shares the slide.
    const heading = moved.size > 1 ? `${SHARED_STIMULUS_HEADING}\n` : "";
    segments.push(`${heading}${parts.sharedStimulus.content.trim()}`);
  }
  parts.statements.forEach((statement, index) => {
    if (statement.stimulus && moved.has(index)) {
      segments.push(
        `${stimulusHeadingLine(index + 1)}\n${statement.stimulus.content.trim()}`,
      );
    }
  });
  return renderSegments(segments);
}

const fits = (text: string) => estimateRenderedLines(text) <= MAX_SLIDE_LINES;

/**
 * Builds the stored versions of a practice task from its parts.
 *
 * `practice` is the full task (lesson plan and worksheet, no length limit).
 * For the slides:
 *   1. the full task fits on the task slide: no slide fields at all;
 *   2. stimuli move to the stimulus slide, largest first, until the task
 *      fits, each replaced by a "next slide" pointer;
 *   3. if the moved stimuli do not fit their own slide either, they all go to
 *      the worksheet instead (one destination per task, never split);
 *   4. if the instruction and statements alone still do not fit, the
 *      statements are replaced by a worksheet pointer. The instruction is
 *      never dropped.
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
    // Even the instruction and statements alone are too long. Swap the
    // statements (and everything under them) for the worksheet pointer. With
    // no statements there is nothing left to drop, so the slide stays over
    // budget and the cycle-slide-lines scorer flags it.
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

/** Turns the cycle agent's response (structured parts) into the cycle we store (composed strings). */
export function composeCycleFromResponse<
  T extends { practice: PracticeTaskParts; feedback: FeedbackPieces },
>(
  response: T,
): Omit<T, "practice" | "feedback"> &
  Pick<Cycle, "practice" | "feedback"> & {
    practiceSlideText?: string;
    practiceStimulusSlideText?: string;
  } {
  const { practice, practiceSlideText, practiceStimulusSlideText } =
    composePracticeTask(response.practice);
  // Leave the keys out entirely rather than setting undefined: a missing
  // stimulus-slide text is what tells the export to delete that slide.
  return {
    ...response,
    practice,
    feedback: composeFeedback(response.feedback),
    ...(practiceSlideText !== undefined && { practiceSlideText }),
    ...(practiceStimulusSlideText !== undefined && {
      practiceStimulusSlideText,
    }),
  };
}
