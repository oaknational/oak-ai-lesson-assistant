import type { AilaExecutionContext } from "../../types";

export function priorKnowledgeTargetPromptPart(
  ctx: AilaExecutionContext,
): string {
  const priorKnowledge = ctx.currentTurn.document.priorKnowledge ?? [];

  const statements =
    priorKnowledge.length > 0
      ? `The statements below are the lesson's stated prior knowledge and are the primary source for questions:

${priorKnowledge.map((statement) => `- ${statement}`).join("\n")}`
      : "No prior knowledge statements exist yet. Base questions strictly on prerequisite knowledge for this lesson's title and key stage; do not test the lesson's own content.";

  return `## PRIOR KNOWLEDGE TO ASSESS

The starter quiz assesses ONLY knowledge pupils should already have BEFORE this lesson begins.

${statements}

Rules:
- Base questions on the statements above; topic-appropriate prerequisite knowledge for this key stage may supplement them.
- Never test or hint at what this lesson itself will teach. Lesson context is for difficulty calibration only, never a source of questions.`;
}
