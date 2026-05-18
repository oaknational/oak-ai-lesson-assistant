import { aiLogger } from "@oakai/logger";

import type { z } from "zod";

import { AMERICANISM_ISSUE_KIND } from "../../../features/americanisms";
import { AilaAmericanisms } from "../../../features/americanisms/AilaAmericanisms";
import type { SectionKey } from "../schema";
import type { AgentResult, AilaExecutionContext } from "../types";

const americanisms = new AilaAmericanisms();
const log = aiLogger("aila:agents");

/**
 * Detects Americanisms in a freshly generated section. If actionable issues are
 * found it invokes the British English corrector agent and returns validated
 * corrected content. Returns `null` when no correction is needed or the
 * corrector fails and falls back to the original content.
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

  // MEANING flags are advisory only (high false-positive rate), they should never be corrected.
  const actionable = sectionIssues.filter(
    (issue) => issue.issue !== AMERICANISM_ISSUE_KIND.MEANING,
  );

  if (actionable.length === 0) {
    log.info(`british-english-corrector skipped ${sectionKey}`);
    return null;
  }

  log.info(
    `british-english-corrector fired ${sectionKey} actionable=${actionable.length}`,
  );

  // The corrector is best-effort. Errors are not surfaced in `currentTurn.notes` (as this is displayed to the teacher by the message-to-user agent).
  let result: AgentResult<unknown>;
  try {
    result = await context.runtime.britishEnglishCorrectorAgent({
      sectionKey,
      content,
      issues: actionable,
      responseSchema,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`british-english-corrector threw ${sectionKey} ${message}`);
    return null;
  }

  if (result.error) {
    log.error(
      `british-english-corrector errored ${sectionKey} ${result.error.message}`,
    );
    return null;
  }

  const parsed = responseSchema.safeParse(result.data);
  if (!parsed.success) {
    log.error(`british-english-corrector schema-invalid ${sectionKey}`);
    return null;
  }

  return parsed.data;
}
