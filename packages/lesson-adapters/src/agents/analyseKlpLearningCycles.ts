import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

import type { SlideContent } from "../slides/extraction/types";
import { formatSlidesForPrompt, simplifySlideContent } from "./utils";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * Schema for a single slide's KLP and learning cycle mapping
 */
export const slideKlpLcMappingSchema = z.object({
  slideNumber: z.number(),
  slideId: z.string(),
  keyLearningPoints: z
    .array(z.string())
    .describe(
      "Array of key learning point texts covered on this slide (from the lesson KLPs)",
    ),
  learningCycles: z
    .array(z.string())
    .describe(
      "Array of learning cycle texts covered on this slide (from the lesson learning cycles)",
    ),
  reasoning: z
    .string()
    .describe("Brief explanation of why these KLPs and cycles apply"),
});

/**
 * Schema for the KLP/Learning Cycles agent response
 */
export const klpLcAgentResponseSchema = z.object({
  analysis: z
    .string()
    .describe(
      "Overall analysis of how KLPs and learning cycles are distributed across slides",
    ),
  slideMappings: z
    .array(slideKlpLcMappingSchema)
    .describe("Mapping of KLPs and learning cycles for each slide"),
});

export type SlideKlpLcMapping = z.infer<typeof slideKlpLcMappingSchema>;
export type KlpLcAgentResponse = z.infer<typeof klpLcAgentResponseSchema>;

// ---------------------------------------------------------------------------
// Input Schema
// ---------------------------------------------------------------------------

export const analyseKlpLcInputSchema = z.object({
  slides: z.custom<SlideContent[]>(
    (val) => Array.isArray(val) && val.length > 0,
    { message: "slides must be a non-empty array" },
  ),
  keyLearningPoints: z
    .array(z.string())
    .describe("Key learning points from the lesson"),
  learningCycles: z
    .array(z.string())
    .describe("Learning cycles from the lesson"),
});

export type AnalyseKlpLcInput = z.infer<typeof analyseKlpLcInputSchema>;

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an educational expert and content analysis agent that identifies which key learning points (KLPs) and learning cycles are covered on each slide in a lesson presentation.

## Your Task
Analyse each slide in the presentation and determine:
1. Which key learning points (from the provided lesson KLPs) are covered on this slide
2. Which learning cycles (from the provided lesson outline) are covered on this slide

## Input
You receive:
- slides: an array of slide content objects with text elements, tables, and metadata
- keyLearningPoints: an array of KLP strings from the lesson
- learningCycles: an array of learning cycle strings from the lesson outline

## Output
Return a structured analysis mapping KLPs and learning cycles to each slide.

## Rules
- A slide may cover multiple KLPs and/or multiple learning cycles
- A slide will always cover a key learning point unless is it a title slide, keyword slide, outcome slide or teacher note slide
- Match based on content, not just exact text - look for concepts and themes
- Consider text in both textElements and tables when making determinations
- Do not invent new KLPs or learning cycles - only use the ones provided
- Provide clear reasoning for each slide's mappings
- Every slide in the input must have a corresponding entry in slideMappings
- For title slides, teacher notes, keywords, outcome slides, return empty arrays

## Examples
- A slide about photosynthesis basics might cover KLP "Plants use light to make food" and learning cycle "Introduction to plant biology"
- A practice slide might cover multiple KLPs related to the same concept
`;

// ---------------------------------------------------------------------------
// Agent Function
// ---------------------------------------------------------------------------

export async function analyseKlpLearningCycles(
  input: AnalyseKlpLcInput,
): Promise<KlpLcAgentResponse> {
  try {
    console.log(
      `[klpLcAgent] Analyzing ${input.slides.length} slides for KLP/LC coverage`,
    );

    const parsed = analyseKlpLcInputSchema.parse(input);

    // Prepare simplified slide content for the LLM (text and tables only)
    const slidesForPrompt = simplifySlideContent(parsed.slides);

    // Format slides in a more readable structure for the LLM
    const formattedSlides = formatSlidesForPrompt(slidesForPrompt);

    const promptContent = `# Key Learning Points
${parsed.keyLearningPoints.map((klp, i) => `${i + 1}. ${klp}`).join("\n")}

# Learning Cycles
${parsed.learningCycles.map((lc, i) => `${i + 1}. ${lc}`).join("\n")}

# Slides to Analyse
${formattedSlides}

---

Analyse each slide above and map which key learning points and learning cycles it covers.`;

    const { output } = await generateText({
      model: openai("gpt-4o"),
      output: Output.object({ schema: klpLcAgentResponseSchema }),
      system: SYSTEM_PROMPT,
      prompt: promptContent,
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    console.log(
      `[klpLcAgent] Analysis complete: mapped ${output.slideMappings.length} slides`,
    );
    console.log("Prompt used:", promptContent);
    console.log("Output:", JSON.stringify(output, null, 2));

    return output;
  } catch (error) {
    console.error("[klpLcAgent] Analysis failed:", error);
    throw error;
  }
}
