import { pick } from "remeda";

import type { PartialLessonPlan } from "../../../../../protocol/schema";

/**
 * The starter quiz assesses prior knowledge only, so the agent must not see
 * the lesson's own teaching content (key learning points, cycles, keywords,
 * exit quiz); with it in view the model tends to test upcoming material.
 * The learning outcome stays for topic anchoring and difficulty calibration.
 */
export function starterQuizDocumentForPrompt(
  document: PartialLessonPlan,
): PartialLessonPlan {
  return pick(document, [
    "title",
    "subject",
    "keyStage",
    "topic",
    "learningOutcome",
    "priorKnowledge",
  ]);
}
