import OpenAI from "openai";
import { z } from "zod";

import { LessonPlanSchema } from "../../../aila/src/protocol/schema";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const translateRouter = router({
  translateObjectTo: protectedProcedure
    .input(z.object({ lessonPlan: LessonPlanSchema, language: z.string() }))
    .mutation(async ({ input }) => {
      const { lessonPlan, language } = input;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              `You are a helpful assistant that translates lesson text from English to ${language}.` +
              "You will be given a lesson plan and you will need to translate the text to the language specified in the input." +
              "consider the fact that this is educational content and so should be translated in a way that is accurate and easy to understand." +
              "do not include any additional information in your response other than the translated text." +
              "You will be given a json object with the lesson plan. You should return the exact same json object with just the values translated to the language specified in the input." +
              "The keys of the json object should ALWAYS BE IN ENGLISH AND be the exactly same as the original lesson plan.",
          },
          { role: "user", content: JSON.stringify(lessonPlan) },
        ],
      });

      const parsedResponse = JSON.parse(
        response?.choices[0]?.message.content ?? "{}",
      );

      return parsedResponse;
    }),
});
