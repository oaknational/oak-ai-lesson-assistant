import { z } from "zod";

/**
 * The forms feedback can take. Both the prompt and the rendered labels use
 * this list, so the type the model picks always matches the label pupils
 * read.
 */
export const FEEDBACK_TYPES = [
  "Model answer",
  "Success criteria",
  "Worked example",
  "Completed answer",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FeedbackPiecesSchema = z.array(
  z.object({
    type: z
      .enum(FEEDBACK_TYPES)
      .describe(
        "The form of this piece of feedback. Choose the most appropriate for the work pupils produced.",
      ),
    content: z.string()
      .describe(`The feedback itself, without the type label or a number; both are added automatically.
Written so a class of 30 can check their own work against it; the teacher will not have time to check each pupil's.
Separate items in a list with commas. Put each equation or calculation on its own line.`),
  }),
).describe(`The feedback on the practice task, shown to pupils after it.
Either one piece per numbered STATEMENT, in the same order (they are numbered to match automatically), or a single piece that covers the whole task.`);

export type FeedbackPieces = z.infer<typeof FeedbackPiecesSchema>;

/**
 * Builds the stored feedback string. One piece gets no number; several
 * pieces are numbered to match the statements, one per line.
 */
export function composeFeedback(pieces: FeedbackPieces): string {
  if (pieces.length === 1) {
    const piece = pieces[0]!;
    return `${piece.type}: ${piece.content.trim()}`;
  }
  return pieces
    .map(
      (piece, index) => `${index + 1}. ${piece.type}: ${piece.content.trim()}`,
    )
    .join("\n");
}
