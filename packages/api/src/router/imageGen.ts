import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { protectedProcedure } from "../middleware/auth";
import { router } from "../trpc";
import {
  flickrImages,
  unsplashImages,
  type ImageResponse,
} from "./imageSearch";

interface ValidationResult {
  imageData: ImageResponse;
  isValid: boolean;
}

const STABLE_DIF_API_KEY = process.env.STABLE_DIF_API_KEY;
const MAX_PARALLEL_CHECKS = 5;

async function validateImageWithOpenAI(
  imageUrl: string,
  prompt: string,
): Promise<boolean> {
  console.log(`[OpenAI Validation] Starting validation for image: ${imageUrl}`);
  console.log(`[OpenAI Validation] Prompt: ${prompt}`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
    });

    console.log("[OpenAI Validation] Sending request to OpenAI");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an image validator assessing if images are suitable for a classroom setting. " +
            "Consider an image valid if it generally relates to the prompt and is classroom-appropriate, " +
            "even if it's not a perfect match. Respond in this format:\n" +
            "VALID: true/false\n" +
            "REASONING: brief explanation of your decision",
        },
        {
          role: "user",
          content: `Prompt: "${prompt}"\nImage URL: ${imageUrl}\nIs this image suitable and related to the prompt?`,
        },
      ],
      temperature: 0.2,
    });

    const fullResponse = response?.choices?.[0]?.message?.content?.trim() || "";
    console.log(
      `[OpenAI Validation] Full validation response:\n${fullResponse}`,
    );

    // Parse the response with safe defaults
    let isValid = false;
    let reasoning = "No reasoning provided";

    // Check for valid response pattern
    if (fullResponse) {
      const validMatch = fullResponse.match(/VALID:\s*(true|false)/i);
      const reasoningMatch = fullResponse.match(/REASONING:\s*(.*)/i);

      if (validMatch && validMatch[1]) {
        isValid = validMatch[1].toLowerCase() === "true";
      } else {
        console.warn(
          "[OpenAI Validation] Could not parse VALID status from response",
        );
      }

      if (reasoningMatch && reasoningMatch[1]) {
        reasoning = reasoningMatch[1];
      } else {
        console.warn(
          "[OpenAI Validation] Could not parse REASONING from response",
        );
      }
    } else {
      console.warn("[OpenAI Validation] Received empty response from OpenAI");
    }

    console.log(`[OpenAI Validation] Parsed result:`, {
      isValid,
      reasoning,
      prompt,
      imageUrl,
    });

    return isValid;
  } catch (error) {
    console.error("[OpenAI Validation] Error during validation:", error);
    if (error instanceof Error) {
      console.error("[OpenAI Validation] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

async function validateImagesInParallel(
  images: ImageResponse[],
  searchExpression: string,
): Promise<ValidationResult[]> {
  console.log(
    `[Parallel Validation] Starting parallel validation for ${images.length} images`,
  );
  console.log(
    `[Parallel Validation] Will check up to ${MAX_PARALLEL_CHECKS} images`,
  );

  const imagesToCheck = images.slice(0, MAX_PARALLEL_CHECKS);
  console.log(
    `[Parallel Validation] Actually checking ${imagesToCheck.length} images`,
  );

  const validationPromises = imagesToCheck.map(async (image) => {
    console.log(`[Parallel Validation] Validating image: ${image.url}`);
    try {
      const isValid = await validateImageWithOpenAI(
        image.url,
        searchExpression,
      );
      console.log(
        `[Parallel Validation] Validation result for ${image.url}: ${isValid}`,
      );
      return { imageData: image, isValid };
    } catch (error) {
      console.error(
        `[Parallel Validation] Error validating ${image.url}:`,
        error,
      );
      return { imageData: image, isValid: false };
    }
  });

  const results = await Promise.all(validationPromises);
  console.log(
    `[Parallel Validation] Completed validation for ${results.length} images`,
  );
  console.log(
    "[Parallel Validation] Results:",
    results.map((r) => ({ url: r.imageData.url, isValid: r.isValid })),
  );
  return results;
}
async function tryFlickrImages(
  searchExpression: string,
): Promise<ImageResponse | null> {
  console.log(
    `[Flickr] Attempting to fetch Flickr images for: ${searchExpression}`,
  );
  try {
    const flickrResponse = await flickrImages({ searchExpression });
    console.log(
      `[Flickr] Received ${flickrResponse.length} images from Flickr`,
    );

    if (flickrResponse.length === 0) {
      console.log("[Flickr] No images returned from Flickr");
      return null;
    }

    console.log("[Flickr] Starting validation of Flickr images");
    const validationResults = await validateImagesInParallel(
      flickrResponse,
      searchExpression,
    );

    const firstValidImage = validationResults.find((result) => result.isValid);
    if (firstValidImage) {
      console.log(
        `[Flickr] Found valid image: ${firstValidImage.imageData.url}`,
      );
      return {
        ...firstValidImage.imageData,
        license: `Flickr - ${firstValidImage.imageData.license}`,
        photographer: firstValidImage.imageData.photographer || "Flickr User",
      };
    }

    console.log("[Flickr] No valid images found from Flickr");
    return null;
  } catch (error) {
    console.error("[Flickr] Error fetching/validating Flickr images:", error);
    if (error instanceof Error) {
      console.error("[Flickr] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
}

async function tryUnsplashImages(
  searchExpression: string,
): Promise<ImageResponse | null> {
  console.log(
    `[Unsplash] Attempting to fetch Unsplash images for: ${searchExpression}`,
  );
  try {
    const unsplashResponse = await unsplashImages({ searchExpression });
    console.log(
      `[Unsplash] Received ${unsplashResponse.length} images from Unsplash`,
    );

    if (unsplashResponse.length === 0) {
      console.log("[Unsplash] No images returned from Unsplash");
      return null;
    }

    console.log("[Unsplash] Starting validation of Unsplash images");
    const validationResults = await validateImagesInParallel(
      unsplashResponse,
      searchExpression,
    );

    const firstValidImage = validationResults.find((result) => result.isValid);
    if (firstValidImage) {
      console.log(
        `[Unsplash] Found valid image: ${firstValidImage.imageData.url}`,
      );
      return {
        ...firstValidImage.imageData,
        license: "Unsplash License",
        photographer:
          firstValidImage.imageData.photographer || "Unsplash Photographer",
      };
    }

    console.log("[Unsplash] No valid images found from Unsplash");
    return null;
  } catch (error) {
    console.error(
      "[Unsplash] Error fetching/validating Unsplash images:",
      error,
    );
    if (error instanceof Error) {
      console.error("[Unsplash] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
}

async function generateStabilityImage(
  endpoint: string,
  searchExpression: string,
  outputFormat: "webp" | "jpeg" = "webp",
): Promise<string> {
  console.log(`[Stability ${endpoint}] Starting image generation`);
  console.log(`[Stability ${endpoint}] Prompt: ${searchExpression}`);

  const formData = new FormData();
  formData.append("prompt", searchExpression);
  formData.append("output_format", outputFormat);

  try {
    console.log(`[Stability ${endpoint}] Sending request to Stability AI`);
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
      console.error(`[Stability ${endpoint}] API error:`, {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Image generation failed with status ${response.status}`);
    }

    console.log(`[Stability ${endpoint}] Successfully received image response`);
    const imageBuffer = await response.arrayBuffer();
    const base64Image = `data:image/${outputFormat};base64,${Buffer.from(imageBuffer).toString("base64")}`;
    console.log(`[Stability ${endpoint}] Successfully encoded image to base64`);
    return base64Image;
  } catch (error) {
    console.error(`[Stability ${endpoint}] Error:`, error);
    throw error;
  }
}

async function tryStabilityCore(
  searchExpression: string,
): Promise<ImageResponse | null> {
  console.log("[StabilityCore] Starting image generation attempt");
  try {
    const imageUrl = await generateStabilityImage("core", searchExpression);
    console.log("[StabilityCore] Image generated, starting validation");

    const isValid = await validateImageWithOpenAI(imageUrl, searchExpression);
    console.log(`[StabilityCore] Validation result: ${isValid}`);

    if (isValid) {
      console.log("[StabilityCore] Image validated successfully");
      return {
        id: uuidv4(),
        url: imageUrl,
        title: `AI Generated: ${searchExpression}`,
        alt: searchExpression,
        license: "Stability AI - Core",
        photographer: "Generated by Stability AI",
      };
    }
    console.log("[StabilityCore] Image validation failed");
    return null;
  } catch (error) {
    console.error("[StabilityCore] Error during generation/validation:", error);
    if (error instanceof Error) {
      console.error("[StabilityCore] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
}

async function tryDallE(
  searchExpression: string,
): Promise<ImageResponse | null> {
  console.log("[DALL-E] Starting image generation attempt");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
    });

    console.log("[DALL-E] Sending request to OpenAI");
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: searchExpression,
      n: 1,
      size: "1024x1024",
    });

    console.log("[DALL-E] Response received:", response);

    if (response?.data?.[0]?.url) {
      const imageUrl = response.data[0].url;
      console.log("[DALL-E] Image generated, starting validation");

      const isValid = await validateImageWithOpenAI(imageUrl, searchExpression);
      console.log(`[DALL-E] Validation result: ${isValid}`);

      if (isValid) {
        console.log("[DALL-E] Image validated successfully");
        return {
          id: uuidv4(),
          url: imageUrl,
          title: `AI Generated: ${searchExpression}`,
          alt: searchExpression,
          license: "OpenAI DALL-E 3",
          photographer: "Generated by DALL-E 3",
        };
      }
    }
    console.log("[DALL-E] No valid image generated");
    return null;
  } catch (error) {
    console.error("[DALL-E] Error during generation/validation:", error);
    if (error instanceof Error) {
      console.error("[DALL-E] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
}
export const imageGen = router({
  customPipeline: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<string> => {
      const { searchExpression } = input;
      console.log(
        `[Pipeline] Starting custom pipeline for prompt: ${searchExpression}`,
      );

      try {
        console.log("[Pipeline] Trying Flickr...");
        const flickrResult = await tryFlickrImages(searchExpression);
        if (flickrResult) {
          console.log("[Pipeline] Flickr success, returning result");
          return flickrResult.url;
        }
        console.log("[Pipeline] Flickr attempt failed, trying Unsplash...");

        const unsplashResult = await tryUnsplashImages(searchExpression);
        if (unsplashResult) {
          console.log("[Pipeline] Unsplash success, returning result");
          return unsplashResult.url;
        }
        console.log(
          "[Pipeline] Unsplash attempt failed, trying Stability Core...",
        );

        const stabilityResult = await tryStabilityCore(searchExpression);
        if (stabilityResult) {
          console.log("[Pipeline] Stability Core success, returning result");
          return stabilityResult.url;
        }
        console.log(
          "[Pipeline] Stability Core attempt failed, trying DALL-E...",
        );

        const dalleResult = await tryDallE(searchExpression);
        if (dalleResult) {
          console.log("[Pipeline] DALL-E success, returning result");
          return dalleResult.url;
        }

        console.log("[Pipeline] All attempts failed");
        throw new Error("No suitable images found from any provider.");
      } catch (error) {
        console.error("[Pipeline] Pipeline error:", error);
        if (error instanceof Error) {
          console.error("[Pipeline] Error details:", {
            message: error.message,
            stack: error.stack,
          });
          throw new Error(`Image pipeline failed: ${error.message}`);
        }
        throw new Error("Image generation failed. Please try again later.");
      }
    }),
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
