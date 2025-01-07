import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { imageLessonPlan } from "../../../../apps/nextjs/src/types/imageTypes";
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

interface RefinementInput {
  originalImageUrl: string;
  originalPrompt: string;
  feedback: string;
  lessonTitle: string;
  subject: string;
  keyStage: string;
  lessonPlan: LessonPlan;
  provider: "openai" | "stability";
}

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
  imagePrompt: string;
}

export function promptConstructor(
  searchExpression: string,
  lessonTitle: string,
  subject: string,
  keyStage: string,
  cycleInfo: Cycle | null,
) {
  if (!cycleInfo) {
    throw new Error("Cycle information is required to construct the prompt.");
  }

  const { title, explanation, practice, feedback } = cycleInfo;
  const { spokenExplanation, accompanyingSlideDetails, slideText } =
    explanation;

  return `You are generating an image for a lesson taught in a uk school following the uk national curriculum. The lesson is at the ${keyStage} level and the subject is  ${subject}. 
  
  The lesson title is ${lessonTitle}. The lesson is broken down in to three learning sections, the title of this section is ${title}. 
  
  The image you are generating is for a slide in this section that will be shown in class, the slide will have the following text on it: ${slideText} and the teacher will say the following: ${spokenExplanation.join(" ")}. Here are some additional details about the slide: ${accompanyingSlideDetails}.

  The students will then practice what they have learned by ${practice} and the teacher will provide feedback by ${feedback}.

  The prompt for the image is ${searchExpression}.`;
}

// Utility Functions
export async function validateImagesInParallel(
  images: ImageResponse[],
  searchExpression: string,
  lessonTitle: string,
  subject: string,
  keyStage: string,
  cycleInfo: Cycle | null,
): Promise<
  {
    imageData: ImageResponse;
    imagePrompt: string;
    validationResult: ValidationResult;
  }[]
> {
  console.log(
    `[Validation] Starting parallel validation for ${images.length} images`,
  );

  const imagesToCheck = images.slice(0, MAX_PARALLEL_CHECKS);

  const validationPromises = imagesToCheck.map(async (image) => {
    const isGeneratedImage =
      image.license.includes("Stable Diffusion") ||
      image.license.includes("OpenAI");
    try {
      const isValid = await validateImageWithOpenAI(
        image.url,
        searchExpression,
        lessonTitle,
        keyStage,
        subject,
        cycleInfo,
      );
      return {
        imageData: image,
        imagePrompt: isGeneratedImage
          ? promptConstructor(
              searchExpression,
              lessonTitle,
              subject,
              keyStage,
              cycleInfo,
            )
          : searchExpression,
        validationResult: isValid,
      };
    } catch (error) {
      console.error(`[Validation] Error validating ${image.url}:`, error);
      return {
        imageData: image,
        imagePrompt: isGeneratedImage
          ? promptConstructor(
              searchExpression,
              lessonTitle,
              subject,
              keyStage,
              cycleInfo,
            )
          : searchExpression,
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

async function generateStabilityImage({
  endpoint,
  searchExpression,
  outputFormat = "webp",
  subject,
  keyStage,
  lessonTitle,
  cycleInfo,
}: {
  endpoint: "core" | "ultra" | "sd3";
  searchExpression: string;
  outputFormat: "webp" | "jpeg";
  subject: string;
  keyStage: string;
  lessonTitle: string;
  cycleInfo: Cycle;
}): Promise<string> {
  const formData = new FormData();
  const prompt = promptConstructor(
    searchExpression,
    lessonTitle,
    subject,
    keyStage,
    cycleInfo,
  );
  formData.append("prompt", prompt);
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
  lessonTitle: string,
  subject: string,
  keyStage: string,
  cycleInfo: Cycle | null,
): Promise<ValidatedImage | null> {
  try {
    const flickrResponse = await flickrImages({ searchExpression });
    if (flickrResponse.length === 0) return null;

    const validationResults = await validateImagesInParallel(
      flickrResponse,
      searchExpression,
      lessonTitle,
      subject,
      keyStage,
      cycleInfo,
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
      imagePrompt: searchExpression,
    };
  } catch (error) {
    console.error("[Flickr] Error:", error);
    return null;
  }
}

async function tryUnsplashImages(
  searchExpression: string,
  lessonTitle: string,
  subject: string,
  keyStage: string,
  cycleInfo: Cycle | null,
): Promise<ValidatedImage | null> {
  try {
    const unsplashResponse = await unsplashImages({ searchExpression });
    if (unsplashResponse.length === 0) return null;

    const validationResults = await validateImagesInParallel(
      unsplashResponse,
      searchExpression,
      lessonTitle,
      subject,
      keyStage,
      cycleInfo,
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
      imagePrompt: searchExpression,
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
  subject: string,
  keyStage: string,
  lessonTitle: string,
  cycleInfo: Cycle | null,
): Promise<ValidatedImage | null> {
  try {
    const imageUrl = await generateStabilityImage({
      endpoint: "core",
      searchExpression,
      outputFormat: "webp",
      subject,
      keyStage,
      lessonTitle,
      cycleInfo,
    });

    const validationResponse = await validateImageWithOpenAI(
      imageUrl,
      searchExpression,
      lessonTitle,
      keyStage,
      subject,
      cycleInfo,
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
      imagePrompt: promptConstructor(
        searchExpression,
        lessonTitle,
        subject,
        keyStage,
        cycleInfo,
      ),
    };
  } catch (error) {
    console.error("[StabilityCore] Error:", error);
    return null;
  }
}

async function tryDallE(
  searchExpression: string,
  lessonTitle: string,
  subject: string,
  keyStage: string,
  cycleInfo: Cycle | null,
): Promise<ValidatedImage | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.HELICONE_EU_HOST,
    });

    const prompt = promptConstructor(
      searchExpression,
      lessonTitle,
      subject,
      keyStage,
      cycleInfo,
    );

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response?.data?.[0]?.url) return null;

    const imageUrl = response.data[0].url;
    const validationResponse = await validateImageWithOpenAI(
      imageUrl,
      searchExpression,
      lessonTitle,
      keyStage,
      subject,
      cycleInfo,
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
      imagePrompt: prompt,
    };
  } catch (error) {
    console.error("[DALL-E] Error:", error);
    return null;
  }
}

type LessonPlan = z.infer<typeof imageLessonPlan>;

export type Cycle = {
  title: string;
  durationInMinutes: number;
  explanation: {
    imagePrompt: string;
    spokenExplanation: string[];
    accompanyingSlideDetails: string;
    slideText: string;
  };
  practice: string;
  feedback: string;
} | null;

function findTheRelevantCycle({
  lessonPlan,
  searchExpression,
}: {
  lessonPlan: LessonPlan;
  searchExpression: string;
}): Cycle {
  if (lessonPlan.cycle1.explanation.imagePrompt === searchExpression) {
    return lessonPlan.cycle1;
  } else if (lessonPlan.cycle2.explanation.imagePrompt === searchExpression) {
    return lessonPlan.cycle1;
  } else if (lessonPlan.cycle3.explanation.imagePrompt === searchExpression) {
    return lessonPlan.cycle1;
  } else {
    throw new Error("Cycle not found");
  }
}

export const imageGen = router({
  customPipelineWithReasoning: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonPlan: imageLessonPlan,
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }): Promise<ValidatedImage[]> => {
      try {
        const results: ValidatedImage[] = [];
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });

        // Get and validate Flickr images
        try {
          const flickrResponse = await flickrImages({
            searchExpression: input.searchExpression,
          });
          if (flickrResponse.length > 0) {
            const validationResults = await validateImagesInParallel(
              flickrResponse,
              input.searchExpression,
              input.lessonTitle,
              input.keyStage,
              input.subject,
              cycleInfo,
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
                imagePrompt: result.imagePrompt,
              })),
            );
          }
        } catch (error) {
          console.error("[CustomPipeline] Flickr error:", error);
        }

        // Get and validate Unsplash images
        try {
          const unsplashResponse = await unsplashImages({
            searchExpression: input.searchExpression,
          });
          if (unsplashResponse.length > 0) {
            const validationResults = await validateImagesInParallel(
              unsplashResponse,
              input.searchExpression,
              input.lessonTitle,
              input.keyStage,
              input.subject,
              cycleInfo,
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
                imagePrompt: result.imagePrompt,
              })),
            );
          }
        } catch (error) {
          console.error("[CustomPipeline] Unsplash error:", error);
        }

        // Try Stability AI
        try {
          const imageUrl = await generateStabilityImage({
            endpoint: "core",
            searchExpression: input.searchExpression,
            outputFormat: "webp",
            subject: input.subject,
            keyStage: input.keyStage,
            lessonTitle: input.lessonTitle,
            cycleInfo,
          });
          const validationResponse = await validateImageWithOpenAI(
            imageUrl,
            input.searchExpression,
            input.lessonTitle,
            input.keyStage,
            input.subject,
            cycleInfo,
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
            imagePrompt: promptConstructor(
              input.searchExpression,
              input.lessonTitle,
              input.subject,
              input.keyStage,
              cycleInfo,
            ),
          });
        } catch (error) {
          console.error("[CustomPipeline] StabilityAI error:", error);
        }

        // Try DALL-E
        try {
          if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
            throw new Error("Missing required OpenAI configuration");
          }

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
              input.lessonTitle,
              input.keyStage,
              input.subject,
              cycleInfo,
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
              imagePrompt: promptConstructor(
                input.searchExpression,
                input.lessonTitle,
                input.subject,
                input.keyStage,
                cycleInfo,
              ),
            });
          }
        } catch (error) {
          console.error("[CustomPipeline] DALL-E error:", error);
        }

        if (results.length === 0) {
          throw new Error("No images found from any provider");
        }

        return results;
      } catch (error) {
        console.error("[CustomPipeline] Pipeline error:", error);
        throw error;
      }
    }),

  customPipeline: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        lessonPlan: imageLessonPlan,
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        const providers = [
          tryFlickrImages,
          tryUnsplashImages,
          tryStabilityCore,
          tryDallE,
        ];

        for (const provider of providers) {
          try {
            const result = await provider(
              input.searchExpression,
              input.lessonTitle,
              input.subject,
              input.keyStage,
              cycleInfo,
            );
            if (result) {
              return {
                url: result.url,
                appropriatenessScore: result.appropriatenessScore,
                appropriatenessReasoning: result.appropriatenessReasoning,
                imageSource: result.imageSource,
              };
            }
          } catch (error) {
            console.error(`[CustomPipeline] Provider error:`, error);
          }
        }

        throw new Error("No suitable images found from any provider");
      } catch (error) {
        console.error("[CustomPipeline] Pipeline error:", error);
        throw error;
      }
    }),

  stableDifUltra: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonTitle: z.string(),
        lessonPlan: imageLessonPlan,
        subject: z.string(),
        keyStage: z.string(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        return await generateStabilityImage({
          endpoint: "ultra",
          searchExpression: input.searchExpression,
          outputFormat: "webp",
          subject: input.subject,
          keyStage: input.keyStage,
          lessonTitle: input.lessonTitle,
          cycleInfo,
        });
      } catch (error) {
        console.error("[StableDifUltra] Error:", error);
        throw error;
      }
    }),

  stableDif3: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonTitle: z.string(),
        lessonPlan: imageLessonPlan,
        subject: z.string(),
        keyStage: z.string(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        return await generateStabilityImage({
          endpoint: "sd3",
          searchExpression: input.searchExpression,
          outputFormat: "jpeg",
          subject: input.subject,
          keyStage: input.keyStage,
          lessonTitle: input.lessonTitle,
          cycleInfo,
        });
      } catch (error) {
        console.error("[StableDif3] Error:", error);
        throw error;
      }
    }),

  stableDifCore: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonTitle: z.string(),
        lessonPlan: imageLessonPlan,
        subject: z.string(),
        keyStage: z.string(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        return await generateStabilityImage({
          endpoint: "core",
          searchExpression: input.searchExpression,
          outputFormat: "webp",
          subject: input.subject,
          keyStage: input.keyStage,
          lessonTitle: input.lessonTitle,
          cycleInfo,
        });
      } catch (error) {
        console.error("[StableDifCore] Error:", error);
        throw error;
      }
    }),

  openAi: protectedProcedure
    .input(
      z.object({
        searchExpression: z.string(),
        lessonTitle: z.string(),
        lessonPlan: imageLessonPlan,
        subject: z.string(),
        keyStage: z.string(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (!process.env.OPENAI_API_KEY || !process.env.HELICONE_EU_HOST) {
          throw new Error("Missing required OpenAI configuration");
        }

        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        const result = await tryDallE(
          input.searchExpression,
          input.lessonTitle,
          input.subject,
          input.keyStage,
          cycleInfo,
        );
        if (!result) {
          throw new Error("Image generation failed. Please try again later.");
        }
        return result.url;
      } catch (error) {
        console.error("[OpenAI] Error:", error);
        throw error;
      }
    }),

  validateImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        prompt: z.string(),
        lessonPlan: imageLessonPlan,
        lessonTitle: z.string(),
        keyStage: z.string(),
        subject: z.string(),
        imageWasGenerated: z.boolean().optional(),
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });

        const prompt = input.imageWasGenerated
          ? promptConstructor(
              input.prompt,
              input.lessonTitle,
              input.subject,
              input.keyStage,
              cycleInfo,
            )
          : input.prompt;

        return await validateImageWithOpenAI(
          input.imageUrl,
          prompt,
          input.lessonTitle,
          input.keyStage,
          input.subject,
          cycleInfo,
        );
      } catch (error) {
        console.error("[ValidateImage] Error:", error);
        throw error;
      }
    }),

  validateImagesInParallel: protectedProcedure
    .input(
      z.object({
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        lessonPlan: imageLessonPlan,
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
        originalPrompt: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });
        return await validateImagesInParallel(
          input.images,
          input.searchExpression,
          input.lessonTitle,
          input.subject,
          input.keyStage,
          cycleInfo,
        );
      } catch (error) {
        console.error("[ValidateImagesInParallel] Error:", error);
        throw error;
      }
    }),
  analyzeAndRegenerate: protectedProcedure
    .input(
      z.object({
        originalImageUrl: z.string(),
        originalPrompt: z.string(),
        feedback: z.string(),
        lessonTitle: z.string(),
        subject: z.string(),
        keyStage: z.string(),
        lessonPlan: imageLessonPlan,
        provider: z.enum(["openai", "stability"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const cycleInfo = findTheRelevantCycle({
          lessonPlan: input.lessonPlan,
          searchExpression: input.originalPrompt,
        });

        // First, analyze the original image with GPT-4 Vision
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.HELICONE_EU_HOST,
        });

        // Get image analysis and refined prompt
        const analysisResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image that was generated for an educational context. 
                  Original prompt: ${input.originalPrompt}
                  User feedback: ${input.feedback}
                  
                  Based on the image and feedback, provide a detailed prompt that would generate an improved version. 
                  Focus on specific visual elements that need to change.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: input.originalImageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        });

        const refinedPrompt = analysisResponse.choices[0]?.message?.content;
        if (!refinedPrompt) {
          throw new Error("Failed to generate refined prompt");
        }

        // pause operations for 10s

        // Construct the final prompt
        const finalPrompt = `${promptConstructor(
          input.originalPrompt,
          input.lessonTitle,
          input.subject,
          input.keyStage,
          cycleInfo,
        )}\n\nRefined requirements based on previous version: ${refinedPrompt}`;

        if (input.provider === "openai") {
          // Generate new image with DALL-E
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
          });

          if (!response?.data?.[0]?.url) {
            throw new Error("Failed to generate image with feedback");
          }

          return response.data[0].url;
        } else if (input.provider === "stability") {
          // For Stability AI, we can use their img2img endpoint
          const formData = new FormData();
          formData.append(
            "init_image",
            await fetch(input.originalImageUrl).then((r) => r.blob()),
          );
          formData.append("prompt", finalPrompt);
          formData.append("image_strength", "0.35"); // How much to preserve from original

          const response = await fetch(
            "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${STABLE_DIF_API_KEY}`,
              },
              body: formData,
            },
          );

          if (!response.ok) {
            throw new Error(`Stability API error: ${response.statusText}`);
          }

          const imageBuffer = await response.arrayBuffer();
          return `data:image/png;base64,${Buffer.from(imageBuffer).toString("base64")}`;
        }

        throw new Error("Invalid provider specified");
      } catch (error) {
        console.error("[AnalyzeAndRegenerate] Error:", error);
        throw error;
      }
    }),
});
