import OpenAI from "openai";
import { z } from "zod";

import { LessonPlanSchemaWhilstStreaming } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import type { ImageCycle } from "./imageGen";

// Define the response schema for the copyright check
const CopyrightCheckResponseSchema = z.object({
  copyright: z.boolean(),
  reasoning: z.string(),
});

export const typesOfImage = z.enum([
  "PHOTO_REALISTIC",
  "DIAGRAM",
  "MAP",
  "TIMELINE",
  "HISTORICAL_PAINTING",
]);

export type CopyrightCheckResponse = z.infer<
  typeof CopyrightCheckResponseSchema
>;

export type TypesOfImage = z.infer<typeof typesOfImage>;
export const imageCategoriserRouter = router({
  promptCopyrightCheck: protectedProcedure
    .input(
      z.object({
        lessonPlan: LessonPlanSchemaWhilstStreaming,
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        cycle: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        searchExpression: z.string(),
        prompt: z.string(),
      }),
    )
    .output(
      z.object({
        copyright: z.boolean(),
        reasoning: z.string(),
      }),
    )
    .mutation(
      async ({
        input,
      }): Promise<{
        copyright: boolean;
        reasoning: string;
      }> => {
        const { prompt: promptToCheck } = input;
        let cycleInfo: ImageCycle | null = null;

        if (input.cycle === 1) {
          cycleInfo = input.lessonPlan.cycle1;
        }
        if (input.cycle === 2) {
          cycleInfo = input.lessonPlan.cycle2;
        }
        if (input.cycle === 3) {
          cycleInfo = input.lessonPlan.cycle3;
        }

        try {
          if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
            throw new Error("Missing required OpenAI configuration");
          }

          const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.HELICONE_EU_HOST,
          });

          const userPrompt = `
          You are an expert at checking if a prompt is likely to lead to copyrighted material.
          The prompt is: ${promptToCheck}.
          The lesson title is: ${input.lessonTitle}.
          The subject is: ${input.subject}.
          The key learning points are: ${input?.lessonPlan?.keyLearningPoints?.join(", ")}.
          The title of the cycle this image belongs in is ${cycleInfo?.title}.
          The slide details and slide text are: ${cycleInfo?.explanation?.accompanyingSlideDetails} and ${cycleInfo?.explanation?.slideText}.
          The search term provided is: ${input.searchExpression}.
        `;

          // Use the tools parameter with function calling for structured output
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: ` 
                You are a copyright expert. It is your job to assess prompts that are going to be used for image generation and determine if they are likely to lead to copyrighted material.
                You will be given a prompt and you will need to determine if the prompt is likely to lead to copyrighted material.
                You will be given the context of the lesson which is not your concern however may be useful. 
                Your sole concern is the prompt and whether it is likely to lead to copyrighted material.
                The main culprit for copyright infringement would be the prompt asking for characters from a book, film or TV show. 
                I.e. if the prompt asks for micky mouse or harry potter characters its a definate fail.
                If the prompt asks for a generic character like 'a superhero' or 'a cartoon character' then this is less clear cut.
                If the prompt is asking for a specific image that is not a character from a book, film or TV show then it is likely to be ok.  
              `,
              },
              { role: "user", content: userPrompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "checkCopyright",
                  description:
                    "Determines if a prompt is likely to lead to copyrighted material",
                  parameters: {
                    type: "object",
                    properties: {
                      copyright: {
                        type: "boolean",
                        description:
                          "True if the prompt is likely to lead to copyrighted material, false otherwise",
                      },
                      reasoning: {
                        type: "string",
                        description:
                          "Explanation of why the prompt is or is not likely to lead to copyrighted material",
                      },
                    },
                    required: ["copyright", "reasoning"],
                  },
                },
              },
            ],
            tool_choice: {
              type: "function",
              function: { name: "checkCopyright" },
            },
          });

          // Extract the function call arguments
          const toolCall = response.choices[0]?.message?.tool_calls?.[0];

          if (
            !toolCall ||
            toolCall.type !== "function" ||
            toolCall.function.name !== "checkCopyright"
          ) {
            throw new Error("Unexpected response format from OpenAI");
          }

          const parsedArguments = JSON.parse(toolCall.function.arguments);
          const validatedResponse =
            CopyrightCheckResponseSchema.parse(parsedArguments);

          return validatedResponse;
        } catch (error) {
          console.error("[CreateImagePrompt] Error:", error);
          throw error;
        }
      },
    ),
  // Rest of the router methods remain unchanged
  imageCategoriser: protectedProcedure
    .input(
      z.object({
        lessonPlan: LessonPlanSchemaWhilstStreaming,
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        cycle: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        searchExpression: z.string(),
      }),
    )
    .output(typesOfImage)
    .mutation(async ({ input }): Promise<TypesOfImage> => {
      // Implementation remains the same
      let cycleInfo: ImageCycle | null = null;

      if (input.cycle === 1) {
        cycleInfo = input.lessonPlan.cycle1;
      }
      if (input.cycle === 2) {
        cycleInfo = input.lessonPlan.cycle2;
      }
      if (input.cycle === 3) {
        cycleInfo = input.lessonPlan.cycle3;
      }

      try {
        if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
          throw new Error("Missing required OpenAI configuration");
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });

        const prompt = ` 
            You are categorising what type of image should be generated for a lesson using DALE.
             
            The image you are writing a prompt to generate will live with a learning cycle of a lesson on a slide. 
            The lesson is about ${input.lessonTitle} for ${input.keyStage} students. The subject is ${input.subject}.
            The key learning points are ${input?.lessonPlan?.keyLearningPoints?.join(", ")}.
            The title of the cycle this image belongs in is ${cycleInfo?.title}.
            The slide details and slide text are: ${cycleInfo?.explanation?.accompanyingSlideDetails} and ${cycleInfo?.explanation?.slideText}.
            The search term provided is: ${input.searchExpression}.

            You must first make a decision about whether the requirement is for a diagram, a map, a timeline, a historical painting or a photo realistic. 
            The criteria for a historical painting is if the lesson requires a painting that exists like the mona lisa or a painting of a historical event. 
            If the requirement is for a scene that could be a painting return it as a photo realistic image.
            Think to yourself before classifying something as a historical painting. If I ask AI to generate this image would it be recreating a famous work of art? 
            If the answer is no then it is not a historical painting. The preference is always to do photo realistic images over a historical painting.
            The preference is possible is for photo realistic images however if not appropriate or educationally useful then other types can be used.

            You should return a string with the type of image that should be generated in one of the following formats:
            PHOTO_REALISTIC
            DIAGRAM
            MAP
            TIMELINE
            HISTORICAL_PAINTING
          `;
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: ` 
                You are an expert at categorising images for educational settings. 
                You are categorising what type of image should be generated for a lesson using DALE.
                You should consider the context of the lesson and the learning cycle to determine the most appropriate type of image to generate.
                You only return strings with the type of image that should be generated.
                The only formats you should return are:
                PHOTO_REALISTIC
                DIAGRAM
                MAP
                TIMELINE
                HISTORICAL_PAINTING    
              `,
            },
            { role: "user", content: prompt },
          ],
        });
        const fullResponse =
          response?.choices?.[0]?.message?.content?.trim() || "";

        const parsedResponse = typesOfImage.parse(fullResponse);

        return parsedResponse;
      } catch (error) {
        console.error("[CreateImagePrompt] Error:", error);
        throw error;
      }
    }),
  createPhotoRealisticImagePrompt: protectedProcedure
    .input(
      z.object({
        lessonPlan: LessonPlanSchemaWhilstStreaming,
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        cycle: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<string> => {
      // Implementation remains the same
      let cycleInfo: ImageCycle | null = null;

      if (input.cycle === 1) {
        cycleInfo = input.lessonPlan.cycle1;
      }
      if (input.cycle === 2) {
        cycleInfo = input.lessonPlan.cycle2;
      }
      if (input.cycle === 3) {
        cycleInfo = input.lessonPlan.cycle3;
      }

      try {
        if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
          throw new Error("Missing required OpenAI configuration");
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });

        const prompt = ` 
            You are writing a prompt to generate a photo realistic image an image using DALE. 
             
            The image you are writing a prompt to generate will live with a learning cycle of a lesson on a slide. 
            The lesson is about ${input.lessonTitle} for ${input.keyStage} students. The subject is ${input.subject}.
            The key learning points are ${input?.lessonPlan?.keyLearningPoints?.join(", ")}.
            The title of the cycle this image belongs in is ${cycleInfo?.title}.
            The slide details and slide text are: ${cycleInfo?.explanation?.accompanyingSlideDetails} and ${cycleInfo?.explanation?.slideText}.
            The search term provided is: ${input.searchExpression}.
            
            Safety and appropriateness:
            What ever you describe will be generated into an image shown in schools. The image should not include anything not school appropriate.

            DETAILS FOR CREATING PHOTO_REALISTIC_PROMPT:
            
            Your response should be the prompt and the prompt alone with no extra context.
            Think about what makes a good prompt for image generation, the prompt should be very clear and concise whilst also being detailed enough to get the desired image.
            Try to avoid adding any extra wording that might confuse the AI.
            The image should be photo realistic.
            You should include what the focus of the image should be e.g. if the image is showing pupils what a penguins is the image should be of a penguin on its own rather than a larger scene with multiple penguins.
            You should be really specific about the image, suggesting an image that will support pupils with their understanding of the explanation. For example if the explanation was about the organelles in a plant cell, the prompt should specify that the image should be a diagram of a plant cell and which organelles should be included in the image. 
            The image should not have any labelling, symbols or text on it, avoid using any trigger words that the AI might interpret as text.
            The end image should be a classroom and age appropriate image.   
            Prefix the prompt with 'A highly detailed 8K photograph taken on a Canon EOS R5 Mark II of a...'. 
            Focus on specific, visually representable elements.
            Describe actions and scenarios rather than abstract concepts.
            Avoid ambiguous language that could be interpreted as including text.
            The description MUST be at least THREE SENTENCES describing the image in detail. 
            Written in the EXPERT_TEACHER voice.
          `;
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at forming image prompts. You create masterful image prompts that allow DAL-E to generate exactly what you want for educational settings. You are heavily tuned into the world of image prompting and are aware of trigger words that may cause the image to try and generate text or symbols. You avoid these words.",
            },
            { role: "user", content: prompt },
          ],
        });
        const fullResponse =
          response?.choices?.[0]?.message?.content?.trim() || "";
        return fullResponse;
      } catch (error) {
        console.error("[CreateImagePrompt] Error:", error);
        throw error;
      }
    }),
  createImagePrompt: protectedProcedure
    .input(
      z.object({
        lessonPlan: LessonPlanSchemaWhilstStreaming,
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        cycle: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      }),
    )
    .mutation(async ({ input }): Promise<string> => {
      // Implementation remains the same
      let cycleInfo: ImageCycle | null = null;

      if (input.cycle === 1) {
        cycleInfo = input.lessonPlan.cycle1;
      }
      if (input.cycle === 2) {
        cycleInfo = input.lessonPlan.cycle2;
      }
      if (input.cycle === 3) {
        cycleInfo = input.lessonPlan.cycle3;
      }

      try {
        if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
          throw new Error("Missing required OpenAI configuration");
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });

        const prompt = ` 
            You are writing a prompt to generate an image using DALE. 
             
            The image you are writing a prompt to generate will live with a learning cycle of a lesson on a slide. 
            The lesson is about ${input.lessonTitle} for ${input.keyStage} students. The subject is ${input.subject}.
            The key learning points are ${input?.lessonPlan?.keyLearningPoints?.join(", ")}.
            The title of the cycle this image belongs in is ${cycleInfo?.title}.
            The slide details and slide text are: ${cycleInfo?.explanation?.accompanyingSlideDetails} and ${cycleInfo?.explanation?.slideText}.

            Safety and appropriateness:
            What ever you describe will be generated into an image shown in schools. The image should not include anything not school appropriate.


            DETAILS FOR CREATING IMAGE PROMPT:
            You must first make a decision about whether the requirement is for a diagram, a map, a timeline, a historical painting or a photo realistic. The preference is always to do photo realistic images.
            If the image should be photo realistic use the PHOTO_REALISTIC_PROMP.
            If the image should be a diagram or illustration use the DIAGRAM_PROMPT.
            If the image should be a map use the MAP_PROMPT.
            If the image should be a timeline use the TIMELINE_PROMPT.
            If the image should be a historical painting use the HISTORICAL_PAINTING.
            Your response should be the prompt and the prompt alone with no extra context.
            Think about what makes a good prompt for image generation, the prompt should be very clear and concise whilst also being detailed enough to get the desired image.
            Try to avoid adding any extra wording that might confuse the AI.
            Find a way to prompt the image to ensure there are absolutely no labels, symbols or text on the image.
            

            PHOTO_REALISTIC_PROMPT:
            The image should be photo realistic.
            You should include what the focus of the image should be e.g. if the image is showing pupils what a penguins is the image should be of a penguin on its own rather than a larger scene with multiple penguins.
            You should be really specific about the image, suggesting an image that will support pupils with their understanding of the explanation. For example if the explanation was about the organelles in a plant cell, the prompt should specify that the image should be a diagram of a plant cell and which organelles should be included in the image. 
            The image should not have any labelling, symbols or text on it.
            The end image should be a classroom and age appropriate image.   
            Prefix the prompt with 'A highly detailed 8K photograph taken on a Canon EOS R5 Mark II of a...'. 
            Focus on specific, visually representable elements.
            Describe actions and scenarios rather than abstract concepts.
            The image should not have any labelling, symbols or text on it, avoid using any trigger words that the AI might interpret as text.
            Avoid ambiguous language that could be interpreted as including text.
            The description MUST be at least THREE SENTENCES describing the image in detail. 
            Written in the EXPERT_TEACHER voice.
            
            DIAGRAM_PROMPT:
            return: "DIAGRAM_PROMPT: We do not currently support generating diagrams.

            MAP_PROMPT:
            return: "MAP_PROMPT: We do not currently support generating maps.

            TIMELINE_PROMPT:
            return: "TIMELINE_PROMPT: We do not currently support generating timelines.

            HISTORICAL_PAINTING:
            return: "HISTORICAL_PAINTING: We do not currently support generating historical paintings.

          `;
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at forming image prompts. You create masterful image prompts that allow DAL-E to generate exactly what you want for educational settings.",
            },
            { role: "user", content: prompt },
          ],
        });
        const fullResponse =
          response?.choices?.[0]?.message?.content?.trim() || "";
        return fullResponse;
      } catch (error) {
        console.error("[CreateImagePrompt] Error:", error);
        throw error;
      }
    }),
});
