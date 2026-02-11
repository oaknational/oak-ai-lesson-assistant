import { aiLogger } from "@oakai/logger";

import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";

import {
  type SlidesAgentResponse,
  normalizeAgentResponse,
} from "../../schemas/plan";
import { type SimplifiedSlideContent, formatSlidesForPrompt } from "../utils";
import type { IntentConfig } from "./intents";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_BATCH_SIZE = 20;
export const LLM_TIMEOUT_MS = 300_000; // 5 minutes per batch

// ---------------------------------------------------------------------------
// LLM Call
// ---------------------------------------------------------------------------

/**
 * Makes a single LLM call for a set of slides and returns the normalized response.
 */
export async function callSlidesAgent(
  config: IntentConfig,
  editType: string,
  userMessage: string,
  slides: SimplifiedSlideContent[],
): Promise<SlidesAgentResponse | undefined> {
  const formattedSlides = formatSlidesForPrompt(slides);
  const prompt = `Edit type: ${editType}
User message: ${userMessage}
Processing ${slides.length} slide(s)

# Slides to Analyse
${formattedSlides}

---
Reminder: Return your response using the schema with textEdits, tableCellEdits, textElementDeletions, and slideDeletions arrays.`;

  const { output, text } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: config.schema }),
    system: config.prompt,
    prompt,
    abortSignal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!output) {
    log.error(
      "Slides agent: output is undefined — model response failed schema validation. Raw text: %s",
      text,
    );
    return undefined;
  }

  return normalizeAgentResponse(output);
}

// ---------------------------------------------------------------------------
// Batch Processing
// ---------------------------------------------------------------------------

/**
 * Splits slides into batches and processes them in parallel using Promise.allSettled.
 * This significantly reduces wall-clock time for large presentations.
 */
export async function processInBatches(
  config: IntentConfig,
  editType: string,
  userMessage: string,
  slides: SimplifiedSlideContent[],
): Promise<SlidesAgentResponse | undefined> {
  const batchSize =
    config.processingMode === "standard"
      ? (config.batchSize ?? DEFAULT_BATCH_SIZE)
      : DEFAULT_BATCH_SIZE;
  const batches: SimplifiedSlideContent[][] = [];
  for (let i = 0; i < slides.length; i += batchSize) {
    batches.push(slides.slice(i, i + batchSize));
  }

  log.info(
    `Processing ${batches.length} batches of up to ${batchSize} slides in parallel`,
  );

  const results = await Promise.allSettled(
    batches.map((batch, idx) => {
      log.info(`Starting batch ${idx + 1}/${batches.length}`);
      return callSlidesAgent(config, editType, userMessage, batch);
    }),
  );

  const batchResults: SlidesAgentResponse[] = [];
  for (const [idx, result] of results.entries()) {
    if (result.status === "fulfilled" && result.value) {
      batchResults.push(result.value);
    } else if (result.status === "rejected") {
      log.error(`Batch ${idx + 1}/${batches.length} failed: ${result.reason}`);
    } else {
      log.warn(`Batch ${idx + 1}/${batches.length} returned no output`);
    }
  }

  if (batchResults.length === 0) {
    log.error("All batches failed to produce output");
    return undefined;
  }

  log.info(
    `Completed ${batchResults.length}/${batches.length} batches successfully`,
  );

  return mergeBatchResults(batchResults);
}

/**
 * Merges multiple batch results into a single SlidesAgentResponse.
 */
export function mergeBatchResults(
  results: SlidesAgentResponse[],
): SlidesAgentResponse {
  return {
    analysis: results.map((r) => r.analysis).join("\n\n"),
    changes: {
      textEdits: results.flatMap((r) => r.changes.textEdits),
      tableCellEdits: results.flatMap((r) => r.changes.tableCellEdits),
      textElementDeletions: results.flatMap(
        (r) => r.changes.textElementDeletions,
      ),
      slideDeletions: results.flatMap((r) => r.changes.slideDeletions),
      slidesToKeep: results.flatMap((r) => r.changes.slidesToKeep),
    },
    reasoning: results.map((r) => r.reasoning).join("\n\n"),
  };
}
