import type { AdaptationPlan } from "../schemas/plan";
import type { SlideDeckContent } from "../slides/extraction/types";
import { classifyLessonAdaptIntent } from "./classifierAgent";
import { generateSlidePlan } from "./slidesAgent";

// ---------------------------------------------------------------------------
// Intent config table (Option C)
// Maps each intent to its edit scope and which agents to spawn.
// To support a new intent: add an entry here and ensure each listed agent
// has a registered prompt for that editType.
// ---------------------------------------------------------------------------

type AgentId = "slides"; // | "worksheet" | "quiz" | "lessonDetails" in future

type EditScope = "global" | "structural" | "targeted";

interface IntentConfig {
  scope: EditScope;
  agents: AgentId[];
}

const INTENT_CONFIG: Record<string, IntentConfig> = {
  changeReadingAge: { scope: "global", agents: ["slides"] },
  // Future examples:
  // removeKLP:        { scope: "structural", agents: ["slides", "lessonDetails", "quiz"] },
  // deleteSlide:      { scope: "targeted",   agents: ["slides"] },
  // editSlideText:    { scope: "structural", agents: ["slides"] },
};

const MIN_CONFIDENCE = 0.6;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CoordinateAdaptationInput {
  userMessage: string;
  slideDeck: SlideDeckContent;
}

export type CoordinateAdaptationResult =
  | { success: true; plan: AdaptationPlan }
  | { success: false; reason: string; intent?: string };

// ---------------------------------------------------------------------------
// Coordinator
// ---------------------------------------------------------------------------

/**
 * Coordinates the adaptation pipeline:
 *   classify intent → validate confidence → look up agent config → spawn agents → assemble plan.
 *
 * This is a plain TypeScript function (not an LLM agent) for deterministic
 * routing and testability.
 */
export async function coordinateAdaptation(
  input: CoordinateAdaptationInput,
): Promise<CoordinateAdaptationResult> {
  const { userMessage, slideDeck } = input;

  // 1. Classify intent
  let classification;
  try {
    classification = await classifyLessonAdaptIntent(userMessage);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown classifier error";
    console.error("[coordinator] Classification failed:", message);
    return { success: false, reason: `Classification error: ${message}` };
  }

  if (!classification) {
    return { success: false, reason: "Classifier returned no output" };
  }

  console.log(
    `[coordinator] Classified as "${classification.intent}" ` +
      `(confidence: ${classification.confidence}, reasoning: "${classification.reasoning}")`,
  );

  // 2. Check confidence threshold
  if (classification.confidence < MIN_CONFIDENCE) {
    return {
      success: false,
      reason: `Classification confidence too low (${classification.confidence} < ${MIN_CONFIDENCE})`,
      intent: classification.intent,
    };
  }

  // 3. Look up intent config
  const config = INTENT_CONFIG[classification.intent];
  if (!config) {
    return {
      success: false,
      reason: `Intent "${classification.intent}" is not yet supported`,
      intent: classification.intent,
    };
  }

  // 4. Dispatch agents
  // Currently only the slides agent exists. When more agents are added,
  // this becomes Promise.all across all agents listed in config.agents.
  let slidesResponse;
  if (config.agents.includes("slides")) {
    try {
      slidesResponse = await generateSlidePlan({
        editType: classification.intent,
        userMessage,
        slides: slideDeck.slides,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown slides agent error";
      console.error("[coordinator] Slides agent failed:", message);
      return {
        success: false,
        reason: `Slides agent error: ${message}`,
        intent: classification.intent,
      };
    }

    if (!slidesResponse) {
      return {
        success: false,
        reason: "Slides agent returned no response",
        intent: classification.intent,
      };
    }
  }

  if (!slidesResponse) {
    return {
      success: false,
      reason: "No agent produced a response",
      intent: classification.intent,
    };
  }

  // 5. Assemble plan
  const totalChanges =
    slidesResponse.changes.textEdits.length +
    slidesResponse.changes.tableCellEdits.length +
    slidesResponse.changes.textElementDeletions.length +
    slidesResponse.changes.slideDeletions.length;

  console.log(
    `[coordinator] Plan assembled: ${totalChanges} changes across ${slideDeck.slides.length} slides`,
  );

  return {
    success: true,
    plan: {
      intent: classification.intent,
      scope: config.scope,
      userMessage,
      classifierConfidence: classification.confidence,
      classifierReasoning: classification.reasoning,
      slidesAgentResponse: slidesResponse,
      totalChanges,
    },
  };
}
