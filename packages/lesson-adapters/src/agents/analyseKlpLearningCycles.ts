import { openai } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

import { slideTypeSchema } from "../slides/extraction/schemas";
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
  slideType: slideTypeSchema.describe(
    "Classification of the slide's purpose/type",
  ),
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
  coversDiversity: z
    .boolean()
    .describe(
      "Whether this slide contains diversity content - content that provides opportunities for pupils to see themselves reflected in it, or to learn about experiences beyond their own",
    ),
  reasoning: z
    .string()
    .describe(
      "Brief explanation of why these KLPs and cycles apply, and if coversDiversity is true, explain the diversity content",
    ),
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
1. The slide's type (see Slide Type Classification below)
2. Which key learning points (from the provided lesson KLPs) are covered on this slide
3. Which learning cycles (from the provided lesson outline) are covered on this slide

## Slide Type Classification
Classify every slide as exactly one of these types: replace - unclassified with one of these types
- **title**: The lesson title slide, usually the first slide
- **keywords**: A slide that introduces or defines key vocabulary/terminology for the lesson
- **lessonOutcome**: A slide stating what pupils will learn or achieve by the end of the lesson
- **lessonOutline**: A slide showing the structure or outline of the lesson (e.g. listing learning cycles)
- **summary**: A slide summarising what has been covered in the lesson
- **endOfLesson**: The final slide, typically a closing or "end of lesson" slide
- **teacher**: A slide with instructions or notes for the teacher (not pupil-facing content)
- **copyright**: A slide containing copyright, licensing, or attribution information
- **checkForUnderstanding**: A quiz or comprehension check slide (multiple choice, true/false, short answer)
- **explanation**: A slide that explains a concept, provides information, or teaches new content
- **practice**: A slide with exercises, activities, or tasks for pupils to complete
- **feedback**: A slide that provides answers, model responses, or feedback on a practice activity
- **content**: A general content slide that does not fit the above categories

## Input
You receive:
- slides: an array of slide content objects with text elements, tables, and metadata
- keyLearningPoints: an array of KLP strings from the lesson
- learningCycles: an array of learning cycle strings from the lesson outline

## Output
Return a structured analysis mapping KLPs and learning cycles to each slide.

## Rules
- A slide may cover multiple KLPs and/or multiple learning cycles
- Not every slide will be associated to a KLP
- A KLP or multiple KLPs may be covered across multiple learning cycles
- If a slide contains a keyword or piece of technical language that forms part of a key learning point, assign that key learning point to the slide
- Title slide, teacher note slide, outcome slide, lesson outline slides and end slide will never cover a key learning point
- Practice and feedback slides may cover multiple KLPs - check these carefully for multiple key learning points
- Include the keyword slide if one of the keywords is included in the key learning point or conceptually relates to it
  - Example: KLP "Techniques such as strokes and flourishes can help you create calligraphic letters and words" relates to keyword "stroke"
  - Example: KLP "At Salamis, the Persians were defeated, preventing Persia from conquering Greece" relates to keyword "Conquer"
- Match based on content, not just exact text - look for concepts, themes, and tier 2 or 3 vocabulary
  - Example: KLP "Techniques such as strokes and flourishes can help you create calligraphic letters and words" matches slide content "Strokes can be combined to form letters. Can you see how each these letters is created using the same downstroke as the letter 'C'?"
- Do NOT include slides that do not match a key learning point in content, concept, theme, or provide important knowledge pupils need to learn a key learning point
  - Example: Given key learning points: "Calligraphy involves creating letters with artistic flair to make beautiful handwriting"; "Learning and practising foundational calligraphic strokes builds the skills needed to create decorative letters"; "Techniques such as strokes and flourishes can help you create calligraphic letters and words"; "Practising calligraphy improves fine motor skills"
  - A slide with content "Here you can see a representation of an older calligraphy style, often used during the Middle Ages in Western Europe, and is referred to as 'gothic'" does NOT match any of these KLPs - it provides historical context but does not match the content, concept or theme of a key learning point or relate to important knowledge pupils need to learn a key learning point
- For EVERY slide, check if it contains diversity content and set coversDiversity accordingly — this applies whether or not the slide matches a KLP
  - Diversity content provides opportunities for pupils to see themselves reflected in it, or to learn about experiences beyond their own
  - This includes references or examples of people, artists, scientists, or historical figures from a range of backgrounds (e.g. Henry Ossawa Tanner, Berthe Morisot)
  - Content that contextualises knowledge geographically or historically
  - Content that includes multiple perspectives and world-views
  - A slide can both cover a KLP AND contain diversity content — these are not mutually exclusive
  - Set coversDiversity to true and explain the diversity content in the reasoning field
- Consider text in both textElements and tables when making determinations
- Do not invent new KLPs or learning cycles - only use the ones provided
- Provide clear reasoning for each slide's mappings
- Every slide in the input must have a corresponding entry in slideMappings
- For title slides, teacher notes, outcome slides, lesson outline slides, and end slides, return empty arrays

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

    // Batch slides for LLM calls
    const batchSize = 20;
    const slideBatches: SlideContent[][] = [];
    for (let i = 0; i < parsed.slides.length; i += batchSize) {
      slideBatches.push(parsed.slides.slice(i, i + batchSize));
    }

    // Prepare prompts for each batch
    const batchPromises = slideBatches.map(async (batchSlides, batchIdx) => {
      const slidesForPrompt = simplifySlideContent(batchSlides);
      console.log("slide for prompt", slidesForPrompt);
      const formattedSlides = formatSlidesForPrompt(slidesForPrompt, {
        includeElementIds: false,
      });
      console.log("formatted slides for prompt", formattedSlides);
      const promptContent = `# Key Learning Points\n${parsed.keyLearningPoints.map((klp, i) => `${i + 1}. ${klp}`).join("\n")}\n\n# Learning Cycles\n${parsed.learningCycles.map((lc, i) => `${i + 1}. ${lc}`).join("\n")}\n\n# Slides to Analyse\n${formattedSlides}\n\n---\n\nAnalyse each slide above and map which key learning points, learning cycles, slide type and diversity content it covers.`;
      console.log(`Prompt for batch ${batchIdx + 1}:\n`, promptContent);
      const { output } = await generateText({
        model: openai("gpt-4o"),
        output: Output.object({ schema: klpLcAgentResponseSchema }),
        system: SYSTEM_PROMPT,
        prompt: promptContent,
        temperature: 0.3,
      });
      return output;
    });

    // Run all batches in parallel
    const batchResults = await Promise.all(batchPromises);

    // Consolidate results
    const allSlideMappings = batchResults.flatMap((r) => r.slideMappings);
    const allAnalyses = batchResults.map(
      (r, i) => `Batch ${i + 1}: ${r.analysis}`,
    );
    const consolidatedAnalysis = allAnalyses.join("\n\n");

    console.log(
      `[klpLcAgent] Analysis complete: mapped ${allSlideMappings.length} slides`,
    );
    console.log(
      `[klpLcAgent] Sample mapping:`,
      JSON.stringify(allSlideMappings, null, 2),
    );
    return {
      analysis: consolidatedAnalysis,
      slideMappings: allSlideMappings,
    };
  } catch (error) {
    console.error("[klpLcAgent] Analysis failed:", error);
    throw error;
  }
}
