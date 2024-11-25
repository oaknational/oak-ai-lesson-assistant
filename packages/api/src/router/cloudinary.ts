import { requestImageDescription } from "@oakai/core/src/functions/generation/imageAltTextRequestGeneration.ts/requestImageDescription";
import { aiLogger } from "@oakai/logger";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";

const log = aiLogger("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryRouter = router({
  getCloudinaryImagesBySearchExpression: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { searchExpression } = input;
      return await cloudinary.search
        .expression(searchExpression)
        .max_results(10)
        .with_field("context")
        .execute()
        .then((result: unknown) => {
          return result;
        });
    }),
  getCloundinaryImages: protectedProcedure
    .input(
      z.object({
        batchId: z.string().nullable(),
      }),
    )
    .query(async ({ input }) => {
      const { batchId } = input;
      const maxResults = 10;
      if (batchId) {
        return await cloudinary.search
          .expression()
          .max_results(maxResults)
          .with_field("context")
          .next_cursor(batchId)
          .execute()
          .then((result: unknown) => {
            return result;
          });
      }
      return await cloudinary.search
        .expression()
        .max_results(maxResults)
        .with_field("context")
        .execute()
        .then((result: unknown) => {
          return result;
        });
    }),
  generateAltText: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        alt: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { imageUrl, alt: currentAlt } = input;

      return await requestImageDescription(imageUrl, currentAlt, false);
    }),
  generateQuizAltText: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        alt: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { imageUrl, alt: currentAlt } = input;

      return await requestImageDescription(imageUrl, currentAlt, true);
    }),
  uploadToCloudinary: protectedProcedure
    .input(
      z.object({
        alt: z.string(),
        publicId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { alt, publicId } = input;

      const response = await cloudinary.api.update(publicId, {
        context: `alt=${alt}|gptGenerated=true`,
      });

      log.info("Response from cloudinary", response);
      return true;
    }),
});
