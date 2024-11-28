import OpenAI from "openai";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const STABLE_DIF_API_KEY = process.env.STABLE_DIF_API_KEY;

export const imageGen = router({
  stableDifUltra: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { searchExpression } = input;

      try {
        // Construct the form data
        const formData = new FormData();
        formData.append("prompt", searchExpression);
        formData.append("output_format", "webp");

        // Make the request using fetch
        const response = await fetch(
          `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${STABLE_DIF_API_KEY}`,
              Accept: "image/*",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Image generation failed with status ${response.status}`,
          );
        }
        // return "https://unsplash.com/photos/1";
        // Response is expected to be an image buffer
        const imageBuffer = await response.arrayBuffer();
        const imageUrl = `data:image/webp;base64,${Buffer.from(imageBuffer).toString("base64")}`;

        return imageUrl;
      } catch (error) {
        throw new Error("Image generation failed. Please try again later.");
      }
    }),
  stableDif3: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { searchExpression } = input;

      try {
        // Construct the form data
        const formData = new FormData();
        formData.append("prompt", searchExpression);
        formData.append("output_format", "jpeg");

        // Make the request using fetch
        const response = await fetch(
          `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${STABLE_DIF_API_KEY}`,
              Accept: "image/*",
            },
          },
        );

        const imageBuffer = await response.arrayBuffer();

        const imageUrl = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString("base64")}`;
        return imageUrl;
      } catch (error) {
        throw new Error("Image generation failed. Please try again later.");
      }
    }),
  stableDifCore: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { searchExpression } = input;

      try {
        // Construct the form data
        const formData = new FormData();
        formData.append("prompt", searchExpression);
        formData.append("output_format", "webp");

        // Make the request using fetch
        const response = await fetch(
          "https://api.stability.ai/v2beta/stable-image/generate/core",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${STABLE_DIF_API_KEY}`,
              Accept: "image/*",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Image generation failed with status ${response.status}`,
          );
        }
        // return "https://unsplash.com/photos/1";
        // Response is expected to be an image buffer
        const imageBuffer = await response.arrayBuffer();
        const imageUrl = `data:image/webp;base64,${Buffer.from(imageBuffer).toString("base64")}`;

        return imageUrl;
      } catch (error) {
        throw new Error("Image generation failed. Please try again later.");
      }
    }),
  openAi: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { searchExpression } = input;

      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: searchExpression,
          n: 1,
          size: "1024x1024",
        });

        if (!response || response === undefined) {
          throw new Error("No response from OpenAI");
        }
        console.log("response", response);

        const image_url = response?.data[0]?.url;

        return image_url;
      } catch (error) {
        // console.error("Error generating image:", error);
        throw new Error("Image generation failed. Please try again later.");
      }
    }),
});
