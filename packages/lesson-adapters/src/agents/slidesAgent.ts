import { aiLogger } from "@oakai/logger";

import type { SlidesAgentResponse } from "../schemas/plan";
import {
  DEFAULT_BATCH_SIZE,
  type GenerateSlidePlanInput,
  INTENT_CONFIGS,
  SUPPORTED_EDIT_TYPES,
  callSlidesAgent,
  filterSlideContent,
  generateSlidePlanInputSchema,
  processInBatches,
  validateAgentOutput,
} from "./slidesAgent/index";
import { generateKlpBatchedSlidePlan } from "./slidesAgent/klpBatchedProcessing";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

export async function generateSlidePlan(
  input: GenerateSlidePlanInput,
): Promise<SlidesAgentResponse | undefined> {
  try {
    log.info("Generating slide plan", {
      editType: input.editType,
      userMessage: input.userMessage,
      slideCount: input.slides.length,
    });

    const parsed = generateSlidePlanInputSchema.parse(input);
    const config = INTENT_CONFIGS[parsed.editType];

    if (!config) {
      throw new Error(
        `No config registered for editType: "${parsed.editType}". ` +
          `Available: ${SUPPORTED_EDIT_TYPES.join(", ")}`,
      );
    }

    const slidesForPrompt = filterSlideContent(
      parsed.slides,
      config.slideFields,
    );

    // Branch based on processing mode
    let output: SlidesAgentResponse | undefined;

    if (config.processingMode === "klpBatched") {
      output = await generateKlpBatchedSlidePlan(
        config,
        slidesForPrompt,
        parsed.userMessage,
      );
    } else {
      // Standard processing: batch by slide count if needed
      const batchSize = config.batchSize ?? DEFAULT_BATCH_SIZE;
      const shouldBatch = slidesForPrompt.length > batchSize;

      output = shouldBatch
        ? await processInBatches(
            config,
            parsed.editType,
            parsed.userMessage,
            slidesForPrompt,
          )
        : await callSlidesAgent(
            config,
            parsed.editType,
            parsed.userMessage,
            slidesForPrompt,
          );
    }

    if (!output) {
      return undefined;
    }

    const validated = validateAgentOutput(output, parsed.slides);

    log.info("Generated slide plan", {
      textEdits: validated.changes.textEdits.length,
      tableCellEdits: validated.changes.tableCellEdits.length,
      textElementDeletions: validated.changes.textElementDeletions.length,
      slideDeletions: validated.changes.slideDeletions.length,
    });

    return validated;
  } catch (error) {
    log.error(
      "Error generating slide plan: %s",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

// Re-export types for public API
export { generateSlidePlanInputSchema, type GenerateSlidePlanInput };
export type { SlidesAgentResponse };
