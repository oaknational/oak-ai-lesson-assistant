import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import {
  validateImageWithOpenAI,
  type ValidationResult,
} from "../imageGen/validateImageWithOpenAI";
import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import {
  flickrImages,
  unsplashImages,
  type ImageResponse,
} from "./imageSearch";

// Constants
const STABLE_DIF_API_KEY = process.env.STABLE_DIF_API_KEY;
const MAX_PARALLEL_CHECKS = 5;

// Types
interface ValidatedImage {
  id: string;
  url: string;
  appropriatenessScore: number;
  appropriatenessReasoning: string;
  imageSource: string;
  license: string;
  photographer: string;
  alt?: string;
  title?: string;
}

// Utility Functions
export async function validateImagesInParallel(
  images: ImageResponse[],
  searchExpression: string,
): Promise<{ imageData: ImageResponse; validationResult: ValidationResult }[]> {
  console.log(
    `[Validation] Starting parallel validation for ${images.length} images`,
  );

  const imagesToCheck = images.slice(0, MAX_PARALLEL_CHECKS);

  const validationPromises = imagesToCheck.map(async (image) => {
    try {
      const isValid = await validateImageWithOpenAI(
        image.url,
        searchExpression,
      );
      return { imageData: image, validationResult: isValid };
    } catch (error) {
      console.error(`[Validation] Error validating ${image.url}:`, error);
      return {
        imageData: image,
        validationResult: {
          isValid: false,
          metadata: {
            imageContent: "Error validating image",
            promptUsed: searchExpression,
            appropriatenessScore: 0,
            validationReasoning: "Error validating",
          },
        },
      };
    }
  });

  return Promise.all(validationPromises);
}

async function generateStabilityImage(
  endpoint: "core" | "ultra" | "sd3",
  searchExpression: string,
  outputFormat: "webp" | "jpeg" = "webp",
): Promise<string> {
  const formData = new FormData();
  formData.append("prompt", searchExpression);
  formData.append("output_format", outputFormat);

  const response = await fetch(
    `https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`,
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
    throw new Error(`Image generation failed with status ${response.status}`);
  }

  const imageBuffer = await response.arrayBuffer();
  return `data:image/${outputFormat};base64,${Buffer.from(imageBuffer).toString("base64")}`;
}

// Image Source Functions
async function tryFlickrImages(
  searchExpression: string,
): Promise<ValidatedImage | null> {
  try {
    const flickrResponse = await flickrImages({ searchExpression });
    if (flickrResponse.length === 0) return null;

    const validationResults = await validateImagesInParallel(
      flickrResponse,
      searchExpression,
    );
    const firstValidImage = validationResults.find(
      (result) => result.validationResult.isValid,
    );

    if (!firstValidImage) return null;

    return {
      ...firstValidImage.imageData,
      id: uuidv4(),
      appropriatenessScore:
        firstValidImage.validationResult.metadata.appropriatenessScore,
      appropriatenessReasoning:
        firstValidImage.validationResult.metadata.validationReasoning,
      license: `Flickr - ${firstValidImage.imageData.license}`,
      photographer: firstValidImage.imageData.photographer || "Flickr User",
      imageSource: "Flickr",
    };
  } catch (error) {
    console.error("[Flickr] Error:", error);
    return null;
  }
}

async function tryUnsplashImages(
  searchExpression: string,
): Promise<ValidatedImage | null> {
  try {
    const unsplashResponse = await unsplashImages({ searchExpression });
    if (unsplashResponse.length === 0) return null;

    const validationResults = await validateImagesInParallel(
      unsplashResponse,
      searchExpression,
    );
    const firstValidImage = validationResults.find(
      (result) => result.validationResult.isValid,
    );

    if (!firstValidImage) return null;

    return {
      ...firstValidImage.imageData,
      id: uuidv4(),
      appropriatenessScore:
        firstValidImage.validationResult.metadata.appropriatenessScore,
      appropriatenessReasoning:
        firstValidImage.validationResult.metadata.validationReasoning,
      license: "Unsplash License",
      imageSource: "Unsplash",
      photographer:
        firstValidImage.imageData.photographer || "Unsplash Photographer",
    };
  } catch (error) {
    console.error("[Unsplash] Error:", error);
    return null;
  }
}

async function tryStabilityCore(
  searchExpression: string,
): Promise<ValidatedImage | null> {
  try {
    const imageUrl = await generateStabilityImage("core", searchExpression);

    console.log("**************************************************");
    console.log("imageUrl", imageUrl);
    console.log("**************************************************");

    const validationResponse = await validateImageWithOpenAI(
      imageUrl,
      searchExpression,
    );

    if (!validationResponse.isValid) return null;

    return {
      id: uuidv4(),
      url: imageUrl,
      title: `AI Generated: ${searchExpression}`,
      alt: searchExpression,
      license: "Stability AI - Core",
      photographer: "Generated by Stability AI",
      appropriatenessScore: validationResponse.metadata.appropriatenessScore,
      appropriatenessReasoning: validationResponse.metadata.validationReasoning,
      imageSource: "Stability AI",
    };
  } catch (error) {
    console.error("[StabilityCore] Error:", error);
    return null;
  }
}

async function tryDallE(
  searchExpression: string,
): Promise<ValidatedImage | null> {
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

    if (!response?.data?.[0]?.url) return null;

    const imageUrl = response.data[0].url;
    const validationResponse = await validateImageWithOpenAI(
      imageUrl,
      searchExpression,
    );

    if (!validationResponse.isValid) return null;

    return {
      id: uuidv4(),
      url: imageUrl,
      title: `AI Generated: ${searchExpression}`,
      alt: searchExpression,
      license: "OpenAI DALL-E 3",
      imageSource: "OpenAI DALL-E 3",
      photographer: "Generated by DALL-E 3",
      appropriatenessScore: validationResponse.metadata.appropriatenessScore,
      appropriatenessReasoning: validationResponse.metadata.validationReasoning,
    };
  } catch (error) {
    console.error("[DALL-E] Error:", error);
    return null;
  }
}

// Router Definition
export const imageGen = router({
  customPipelineWithReasoning: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }): Promise<ValidatedImage[]> => {
      const results: ValidatedImage[] = [];

      // Get and validate Flickr images
      const flickrResponse = await flickrImages({
        searchExpression: input.searchExpression,
      });
      if (flickrResponse.length > 0) {
        const validationResults = await validateImagesInParallel(
          flickrResponse,
          input.searchExpression,
        );
        results.push(
          ...validationResults.map((result) => ({
            id: uuidv4(),
            url: result.imageData.url,
            appropriatenessScore:
              result.validationResult.metadata.appropriatenessScore,
            appropriatenessReasoning:
              result.validationResult.metadata.validationReasoning,
            imageSource: "Flickr",
            license: `Flickr - ${result.imageData.license}`,
            photographer: result.imageData.photographer || "Flickr User",
            title: result.imageData.title,
            alt: result.imageData.alt,
          })),
        );
      }

      // Get and validate Unsplash images
      const unsplashResponse = await unsplashImages({
        searchExpression: input.searchExpression,
      });
      if (unsplashResponse.length > 0) {
        const validationResults = await validateImagesInParallel(
          unsplashResponse,
          input.searchExpression,
        );
        results.push(
          ...validationResults.map((result) => ({
            id: uuidv4(),
            url: result.imageData.url,
            appropriatenessScore:
              result.validationResult.metadata.appropriatenessScore,
            appropriatenessReasoning:
              result.validationResult.metadata.validationReasoning,
            imageSource: "Unsplash",
            license: "Unsplash License",
            photographer:
              result.imageData.photographer || "Unsplash Photographer",
            title: result.imageData.title,
            alt: result.imageData.alt,
          })),
        );
      }

      // Try Stability AI
      try {
        const imageUrl = await generateStabilityImage(
          "core",
          input.searchExpression,
        );
        const validationResponse = await validateImageWithOpenAI(
          imageUrl,
          input.searchExpression,
        );
        results.push({
          id: uuidv4(),
          url: imageUrl,
          title: `AI Generated: ${input.searchExpression}`,
          alt: input.searchExpression,
          license: "Stability AI - Core",
          photographer: "Generated by Stability AI",
          appropriatenessScore:
            validationResponse.metadata.appropriatenessScore,
          appropriatenessReasoning:
            validationResponse.metadata.validationReasoning,
          imageSource: "Stability AI",
        });
      } catch (error) {
        console.error("[StabilityCore] Error:", error);
      }

      // Try DALL-E
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: input.searchExpression,
          n: 1,
          size: "1024x1024",
        });

        if (response?.data?.[0]?.url) {
          const imageUrl = response.data[0].url;
          const validationResponse = await validateImageWithOpenAI(
            imageUrl,
            input.searchExpression,
          );
          results.push({
            id: uuidv4(),
            url: imageUrl,
            title: `AI Generated: ${input.searchExpression}`,
            alt: input.searchExpression,
            license: "OpenAI DALL-E 3",
            imageSource: "OpenAI DALL-E 3",
            photographer: "Generated by DALL-E 3",
            appropriatenessScore:
              validationResponse.metadata.appropriatenessScore,
            appropriatenessReasoning:
              validationResponse.metadata.validationReasoning,
          });
        }
      } catch (error) {
        console.error("[DALL-E] Error:", error);
      }

      // Return all results, even if some have low appropriateness scores
      if (results.length === 0) {
        throw new Error("No images found from any provider.");
      }

      return results;
    }),

  customPipeline: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }) => {
      const providers = [
        tryFlickrImages,
        tryUnsplashImages,
        tryStabilityCore,
        tryDallE,
      ];

      for (const provider of providers) {
        try {
          const result = await provider(input.searchExpression);
          if (result) {
            return {
              url: result.url,
              appropriatenessScore: result.appropriatenessScore,
              appropriatenessReasoning: result.appropriatenessReasoning,
              imageSource: result.imageSource,
            };
          }
        } catch (error) {
          console.error(`Provider error:`, error);
        }
      }

      throw new Error("No suitable images found from any provider.");
    }),

  stableDifUltra: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }) => {
      return generateStabilityImage("ultra", input.searchExpression);
    }),

  stableDif3: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }) => {
      return generateStabilityImage("sd3", input.searchExpression, "jpeg");
    }),

  stableDifCore: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }) => {
      return generateStabilityImage("core", input.searchExpression);
    }),

  openAi: protectedProcedure
    .input(z.object({ searchExpression: z.string() }))
    .mutation(async ({ input }) => {
      const result = await tryDallE(input.searchExpression);
      if (!result)
        throw new Error("Image generation failed. Please try again later.");
      return result.url;
    }),
  validateImage: protectedProcedure
    .input(z.object({ imageUrl: z.string(), prompt: z.string() }))
    .mutation(async ({ input }) => {
      return validateImageWithOpenAI(input.imageUrl, input.prompt);
    }),
  validateImagesInParallel: protectedProcedure
    .input(
      z.object({
        images: z.array(
          z.object({
            id: z.string(),
            url: z.string(),
            license: z.string(),
            photographer: z.string().optional(),
            alt: z.string().optional(),
          }),
        ),
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return validateImagesInParallel(input.images, input.searchExpression);
    }),
});
