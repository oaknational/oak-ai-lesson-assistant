/**
 * Page break estimation utility for determining footer placement strategy
 * 
 * Google Docs has different footer types:
 * - First page footer: Only appears on page 1
 * - Document footer: Appears on all pages
 * 
 * We only need to show attribution on the last footer. For single-page quizzes,
 * we can use both footers. For multi-page quizzes, we skip the first page footer
 * and only use the document footer so attribution appears on the final page.
 * 
 * This module estimates quiz content height to determine the appropriate
 * footer strategy based on whether content will span multiple pages.
 */
import type { QuizV2Question } from "../../../schema/input.schema";

// Single page capacity and safety padding
export const SINGLE_PAGE_CAPACITY = 19;
export const SAFETY_PADDING = 2;
export const LINE_COUNT_THRESHOLD = SINGLE_PAGE_CAPACITY + SAFETY_PADDING;

/**
 * Count quiz lines/rows needed for quiz content
 *
 * This function estimates the number of vertical lines/rows a quiz will occupy
 * by counting the structural elements of each question type:
 * - Each question title: +1 line
 * - Each answer/pair/item: +1 line
 * - Short-answer questions: +2 lines total (question + answer space)
 * - Spacing between questions: +1 line each
 *
 * @param questions Array of quiz questions
 * @param debug Optional flag to log detailed breakdown
 * @returns Estimated number of lines the quiz will occupy
 */
export function countQuizLines(
  questions: QuizV2Question[],
  debug = false,
): number {
  let height = 0;

  questions.forEach((q, index) => {
    // Each question has a title row
    height += 1;
    if (debug) console.log(`  Q${index + 1} title: +1`);

    if (q.questionType === "multiple-choice") {
      // Each answer option is a row
      height += q.answers.length;
      if (debug) console.log(`  Q${index + 1} answers: +${q.answers.length}`);
    } else if (q.questionType === "match") {
      // Each pair is a row
      height += q.pairs.length;
      if (debug) console.log(`  Q${index + 1} pairs: +${q.pairs.length}`);
    } else if (q.questionType === "order") {
      // Each item to order is a row
      height += q.items.length;
      if (debug) console.log(`  Q${index + 1} items: +${q.items.length}`);
    } else if (q.questionType === "short-answer") {
      // Short answer has two forms, both needing extra space:
      // 1. Separate answer line below the question
      // 2. Inline answer space that makes the question wrap to multiple lines
      height += 1;
      if (debug) console.log(`  Q${index + 1} answer space/wrapping: +1`);
    }

    // Add spacing between questions (except last one)
    if (index < questions.length - 1) {
      height += 1;
      if (debug) console.log(`  Spacing after Q${index + 1}: +1`);
    }
  });

  if (debug) console.log(`  Total height: ${height}`);
  return height;
}

/**
 * Determine footer placement strategy based on quiz content length
 *
 * @param questions Array of quiz questions
 * @returns 'both-footers' if content fits on single page, 'global-only' if multi-page
 */
export function getFooterStrategy(
  questions: QuizV2Question[],
): "both-footers" | "global-only" {
  const lineCount = countQuizLines(questions);
  return lineCount > LINE_COUNT_THRESHOLD ? "global-only" : "both-footers";
}
