import { aiLogger } from "@oakai/logger";

import { openai } from "@ai-sdk/openai";
import { Output, generateText, stepCountIs, tool } from "ai";
import { z } from "zod";

import {
  type SlidesAgentResponse,
  normalizeAgentResponse,
  targetedChangesSchema,
} from "../../schemas/plan";
import type { SimplifiedSlideContent } from "../utils";
import { callSlidesAgent } from "./batching";
import type { IntentConfig, KlpBatchedProcessingConfig } from "./intents";

const log = aiLogger("adaptations");

// ---------------------------------------------------------------------------
// KLP Grouping
// ---------------------------------------------------------------------------

const UNATTACHED_KEY = "__unattached__";

/**
 * Groups slides by the KLPs they cover.
 * A slide covering multiple KLPs appears in multiple groups.
 * Slides with no KLPs go into the "__unattached__" group.
 */
export function groupSlidesByKlp(
  slides: Pick<SimplifiedSlideContent, "slideNumber" | "keyLearningPoints">[],
): Map<string, number[]> {
  const klpToSlides = new Map<string, number[]>();
  const unattached: number[] = [];

  for (const slide of slides) {
    const klps = slide.keyLearningPoints ?? [];
    if (klps.length === 0) {
      unattached.push(slide.slideNumber);
    } else {
      for (const klp of klps) {
        const existing = klpToSlides.get(klp) ?? [];
        existing.push(slide.slideNumber);
        klpToSlides.set(klp, existing);
      }
    }
  }

  if (unattached.length > 0) {
    klpToSlides.set(UNATTACHED_KEY, unattached);
  }

  return klpToSlides;
}

/**
 * Formats KLP groupings as a summary for the orchestrator agent.
 */
function formatKlpSummary(klpToSlides: Map<string, number[]>): string {
  const lines: string[] = [];
  for (const [klp, slideNumbers] of klpToSlides.entries()) {
    const label = klp === UNATTACHED_KEY ? "Unattached (no KLP)" : klp;
    lines.push(`- ${label}: slides ${slideNumbers.join(", ")}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

function isKlpBatchedConfig(
  config: IntentConfig,
): config is KlpBatchedProcessingConfig {
  return config.processingMode === "klpBatched";
}

// ---------------------------------------------------------------------------
// Orchestrator Agent
// ---------------------------------------------------------------------------

/**
 * Generates a slide plan using KLP-batched processing.
 *
 * This approach:
 * 1. Groups slides by the KLPs they cover
 * 2. Uses an orchestrator agent with tools to evaluate each KLP group
 * 3. The orchestrator reconciles conflicting recommendations for multi-KLP slides
 * 4. Returns a unified plan with per-deletion reasoning
 */
export async function generateKlpBatchedSlidePlan(
  config: IntentConfig,
  filteredSlides: SimplifiedSlideContent[],
  userMessage: string,
): Promise<SlidesAgentResponse | undefined> {
  if (!isKlpBatchedConfig(config)) {
    throw new Error(
      "generateKlpBatchedSlidePlan called with non-klpBatched config",
    );
  }

  // Split slides into protected (excluded from deletion evaluation) and evaluatable
  const protectedSlides: SimplifiedSlideContent[] = [];
  const evaluatableFilteredSlides: SimplifiedSlideContent[] = [];
  for (const slide of filteredSlides) {
    if (config.protectedSlideTypes?.includes(slide.slideType ?? "")) {
      protectedSlides.push(slide);
    } else {
      evaluatableFilteredSlides.push(slide);
    }
  }

  // Group evaluatable slides by KLP (protected slides are excluded entirely)
  const klpToSlides = groupSlidesByKlp(evaluatableFilteredSlides);
  const klpSummary = formatKlpSummary(klpToSlides);

  log.info("=== KLP-BATCHED PROCESSING START ===");
  log.info(
    "Input: %d slides (%d protected, %d evaluatable), %d KLP groups",
    filteredSlides.length,
    protectedSlides.length,
    evaluatableFilteredSlides.length,
    klpToSlides.size,
  );
  if (protectedSlides.length > 0) {
    log.info(
      "  Protected slides: [%s]",
      protectedSlides
        .map((s) => `${s.slideNumber} (${s.slideType ?? "unknown"})`)
        .join(", "),
    );
  }
  for (const [klp, slideNums] of klpToSlides.entries()) {
    log.info("  KLP group %s → slides [%s]", klp, slideNums.join(", "));
  }

  // Create a lookup from slideNumber to filtered slide content (evaluatable only)
  const slideByNumber = new Map<number, SimplifiedSlideContent>();
  for (const slide of evaluatableFilteredSlides) {
    slideByNumber.set(slide.slideNumber, slide);
  }

  // Tool: Evaluate slides for a specific KLP
  const evaluateKlpSlidesTool = tool({
    description:
      "Evaluate a group of slides that cover a specific Key Learning Point (KLP) to identify redundant or non-essential slides within that group. Call this once per KLP.",
    inputSchema: z.object({
      klp: z
        .string()
        .describe(
          'The KLP to evaluate, or "__unattached__" for slides with no KLP',
        ),
      slideNumbers: z
        .array(z.number())
        .describe("The slide numbers to evaluate for this KLP"),
    }),
    execute: async ({ klp, slideNumbers }) => {
      log.info("--- TOOL CALL: evaluateKlpSlides ---");
      log.info("  KLP: %s", klp);
      log.info("  Requested slides: [%s]", slideNumbers.join(", "));

      // Filter to just the slides for this KLP
      const klpSlides = slideNumbers
        .map((n: number) => slideByNumber.get(n))
        .filter((s): s is SimplifiedSlideContent => s !== undefined);

      log.info(
        "  Matched %d/%d slides from lookup",
        klpSlides.length,
        slideNumbers.length,
      );

      if (klpSlides.length === 0) {
        log.info("  → No slides found, returning empty result");
        return { klp, slidesToDelete: [], slidesToKeep: [] };
      }

      log.info(
        "  Sending to callSlidesAgent: slides [%s]",
        klpSlides.map((s) => `${s.slideNumber} (${s.slideId})`).join(", "),
      );

      // Call the existing slides agent with the KLP-specific subset
      const result = await callSlidesAgent(
        config,
        "removeNonEssentialContent",
        userMessage,
        klpSlides,
      );

      if (!result) {
        log.warn("  → callSlidesAgent returned no result for KLP: %s", klp);
        return {
          klp,
          slidesToDelete: [],
          slidesToKeep: klpSlides.map((s) => ({
            slideNumber: s.slideNumber,
            slideId: s.slideId,
          })),
        };
      }

      const toolResult = {
        klp,
        slidesToDelete: result.changes.slideDeletions.map((d) => {
          const fullSlide = slideByNumber.get(d.slideNumber);
          const allKlps = fullSlide?.keyLearningPoints ?? [];
          const textContent =
            fullSlide?.textElements?.map((te) => te.content).join("\n") ?? "";

          return {
            slideNumber: d.slideNumber,
            slideId: d.slideId,
            reasoning:
              d.reasoning ?? `Marked for deletion in ${klp} evaluation`,
            slideTitle: fullSlide?.slideTitle ?? "Unknown",
            allKeyLearningPoints: allKlps,
            isMultiKlpSlide: allKlps.length > 1,
            slideTextContent: textContent,
          };
        }),
        slidesToKeep: result.changes.slidesToKeep,
      };

      log.info("  → Tool result for KLP %s:", klp);
      log.info(
        "    Delete: [%s]",
        toolResult.slidesToDelete
          .map(
            (d) =>
              `slide ${d.slideNumber} "${d.slideTitle}": ${d.reasoning} | KLPs: [${d.allKeyLearningPoints.join(", ")}] | multiKLP: ${d.isMultiKlpSlide}`,
          )
          .join("; "),
      );
      log.info(
        "    Keep: [%s]",
        toolResult.slidesToKeep.map((s) => `slide ${s.slideNumber}`).join(", "),
      );

      return toolResult;
    },
  });

  // Build the orchestrator prompt with KLP summary
  const orchestratorPrompt = `## KLP to Slide Mappings
${klpSummary}

## Task
Evaluate each KLP group using the evaluateKlpSlides tool, then reconcile the results into a final plan.

User request: ${userMessage}`;

  log.info("=== ORCHESTRATOR LLM CALL ===");
  log.info("  Model: gpt-4o");
  log.info("  stopWhen: stepCountIs(%d)", klpToSlides.size + 5);
  log.info("  System prompt:\n%s", config.orchestratorPrompt);
  log.info("  User prompt:\n%s", orchestratorPrompt);

  try {
    const { output, steps, text } = await generateText({
      model: openai("gpt-4o"),
      tools: { evaluateKlpSlides: evaluateKlpSlidesTool },
      toolChoice: "auto",
      stopWhen: stepCountIs(klpToSlides.size + 5), // One step per KLP + buffer for reconciliation
      system: config.orchestratorPrompt,
      prompt: orchestratorPrompt,
      output: Output.object({ schema: targetedChangesSchema }),
    });

    log.info("=== ORCHESTRATOR RESULT ===");
    log.info("  Steps completed: %d", steps.length);
    for (const [i, step] of steps.entries()) {
      log.info(
        "  Step %d: finishReason=%s, toolCalls=%d",
        i + 1,
        step.finishReason,
        step.toolCalls.length,
      );
      for (const tc of step.toolCalls) {
        log.info(
          "    Tool call: %s(%s)",
          tc.toolName,
          JSON.stringify("input" in tc ? tc.input : ""),
        );
      }
    }

    if (!output) {
      log.error("Orchestrator agent returned no structured output");
      log.error("  Raw text: %s", text);
      return undefined;
    }

    // Inject protected slides into slidesToKeep
    const protectedKeeps = protectedSlides.map((s) => ({
      slideNumber: s.slideNumber,
      slideId: s.slideId,
    }));
    output.changes.slidesToKeep = [
      ...protectedKeeps,
      ...output.changes.slidesToKeep,
    ];

    log.info(
      "  Final output: %d deletions, %d keeps (%d protected + %d from orchestrator)",
      output.changes.slideDeletions.length,
      output.changes.slidesToKeep.length,
      protectedKeeps.length,
      output.changes.slidesToKeep.length - protectedKeeps.length,
    );
    log.info(
      "  Deletions: %s",
      JSON.stringify(output.changes.slideDeletions, null, 2),
    );
    log.info("=== KLP-BATCHED PROCESSING END ===");

    return normalizeAgentResponse(output);
  } catch (error) {
    log.error(
      "KLP-batched processing failed: %s",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
