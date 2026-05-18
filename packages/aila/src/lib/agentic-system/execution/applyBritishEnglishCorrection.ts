import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import { AMERICANISM_ISSUE_KIND } from "../../../features/americanisms";
import { AilaAmericanisms } from "../../../features/americanisms/AilaAmericanisms";
import type { SectionKey } from "../schema";
import type { AilaExecutionContext } from "../types";

const americanisms = new AilaAmericanisms();
const log = aiLogger("aila:agents");

/**
 * Detect Americanisms in a freshly generated section. If actionable issues are
 * found, invoke the British English corrector agent and return validated
 * corrected content. Returns `null` when no correction is needed or the
 * corrector fails — callers should fall back to the original content.
 */
export async function applyBritishEnglishCorrection({
  context,
  sectionKey,
  content,
  responseSchema,
}: {
  context: AilaExecutionContext;
  sectionKey: SectionKey;
  content: unknown;
  responseSchema: z.ZodTypeAny;
}): Promise<unknown> {
  const detected = americanisms.findAmericanisms({ [sectionKey]: content });
  const sectionIssues = detected[0]?.issues ?? [];

  // MEANING flags are advisory only (high false-positive rate) — never correct.
  const actionable = sectionIssues.filter(
    (issue) => issue.issue !== AMERICANISM_ISSUE_KIND.MEANING,
  );

  if (actionable.length === 0) {
    log.info(`corrector-stat skipped ${sectionKey}`);
    return null;
  }

  log.info(
    `corrector-stat fired ${sectionKey} actionable=${actionable.length}`,
  );

  const result = await context.runtime.britishEnglishCorrectorAgent({
    sectionKey,
    content,
    issues: actionable,
    responseSchema,
  });

  if (result.error) {
    context.currentTurn.notes.push({
      message: `British English corrector errored: ${result.error.message}`,
      sectionKey,
    });
    return null;
  }

  const parsed = responseSchema.safeParse(result.data);
  if (!parsed.success) {
    context.currentTurn.notes.push({
      message:
        "British English corrector returned schema-invalid content; falling back to original",
      sectionKey,
    });
    return null;
  }

  return parsed.data;
}
