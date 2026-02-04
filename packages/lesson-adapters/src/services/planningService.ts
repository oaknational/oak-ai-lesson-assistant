import { z } from "zod";

import {
  type CoordinateAdaptationResult,
  coordinateAdaptation,
} from "../agents/coordinatorAgent";

export const generatePlanInputSchema = z.object({
  userMessage: z.string().min(1),
  slideDeck: z.object({
    slideDeckId: z.string(),
    lessonTitle: z.string(),
    slides: z.array(
      z.object({
        slideNumber: z.number(),
        slideId: z.string(),
        slideTitle: z.string().optional(),
        layoutName: z.string().optional(),
        textElements: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            placeholderType: z.string().optional(),
            placeholderIndex: z.number().optional(),
            layoutObjectId: z.string().optional(),
          }),
        ),
        tables: z.array(
          z.object({
            id: z.string(),
            rows: z.number(),
            columns: z.number(),
            cells: z.array(
              z.array(
                z.object({
                  id: z.string(),
                  content: z.string(),
                  row: z.number(),
                  col: z.number(),
                }),
              ),
            ),
          }),
        ),
        nonTextElements: z.array(
          z.object({
            id: z.string(),
            type: z.enum([
              "shape",
              "image",
              "video",
              "table",
              "line",
              "diagram",
              "unknown",
            ]),
            description: z.string(),
          }),
        ),
      }),
    ),
  }),
});

export type GeneratePlanInput = z.infer<typeof generatePlanInputSchema>;

export async function generatePlan(
  input: GeneratePlanInput,
): Promise<CoordinateAdaptationResult> {
  const parsed = generatePlanInputSchema.parse(input);

  return coordinateAdaptation({
    userMessage: parsed.userMessage,
    slideDeck: parsed.slideDeck,
  });
}
