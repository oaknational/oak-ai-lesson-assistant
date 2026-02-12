import {
  type CoordinateAdaptationResult,
  coordinateAdaptation,
} from "../agents/coordinatorAgent";
import { type GeneratePlanInput, generatePlanInputSchema } from "../schemas";

export async function generatePlan(
  input: GeneratePlanInput,
): Promise<CoordinateAdaptationResult> {
  const parsed = generatePlanInputSchema.parse(input);

  return coordinateAdaptation({
    userMessage: parsed.userMessage,
    slideDeck: parsed.slideDeck,
  });
}
