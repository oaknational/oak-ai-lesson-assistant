import type { ValidationResult } from "@oakai/api/src/imageGen/validateImageWithOpenAI";
import type {
  ImageResponse,
  ImagesFromCloudinary,
  PageData,
} from "types/imageTypes";

import { trpc } from "@/utils/trpc";

interface ImageSearchHookProps {
  pageData: PageData;
}

export const useImageSearch = ({ pageData }: ImageSearchHookProps) => {
  const cloudinaryMutation =
    trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation();
  const flickrMutation = trpc.imageSearch.getImagesFromFlickr.useMutation();
  const unsplashMutation = trpc.imageSearch.getImagesFromUnsplash.useMutation();
  const stableDiffusionCoreMutation = trpc.imageGen.stableDifCore.useMutation();
  const analyzeAndRegenerateMutation =
    trpc.imageGen.analyzeAndRegenerate.useMutation();

  const daleMutation = trpc.imageGen.openAi.useMutation();
  const validateImageMutation = trpc.imageGen.validateImage.useMutation();
  const validateImagesInParallel =
    trpc.imageGen.validateImagesInParallel.useMutation();

  const trpcMutations = {
    "Custom Pipeline Show all with Reasoning":
      trpc.imageGen.customPipelineWithReasoning.useMutation(),
    "Stable Diffusion Ultra": trpc.imageGen.stableDifUltra.useMutation(),
    "Stable Diffusion 3.0 & 3.5": trpc.imageGen.stableDif3.useMutation(),
    "Stable Diffusion Core": stableDiffusionCoreMutation,
    "DAL-E": daleMutation,
    Flickr: flickrMutation,
    Unsplash: unsplashMutation,
    Cloudinary: cloudinaryMutation,
  };

  const regenerateImageWithAnalysis = async (
    originalImageUrl: string,
    originalPrompt: string,
    feedback: string,
    provider: "openai" | "stability",
  ): Promise<ImageResponse> => {
    try {
      if (
        !pageData?.title ||
        !pageData?.keyStage ||
        !pageData?.subject ||
        !pageData?.lessonPlan
      ) {
        throw new Error("Missing required page data");
      }

      const startTime = performance.now();
      const fetchStart = performance.now();

      const response = await analyzeAndRegenerateMutation.mutateAsync({
        originalImageUrl,
        originalPrompt,
        feedback,
        lessonTitle: pageData.title,
        subject: pageData.subject,
        keyStage: pageData.keyStage,
        lessonPlan: pageData.lessonPlan,
        provider,
      });

      const fetchEnd = performance.now();

      // Validate the regenerated image
      const validationStart = performance.now();
      const validationResult = await validateSingleImage(
        response,
        originalPrompt,
        true,
        originalPrompt,
      );
      const endTime = performance.now();
      // generate random string for id
      const id = Math.random().toString(36).substr(2, 9);

      return {
        id: id,
        url: response,
        license: provider === "openai" ? "OpenAI DALL-E 3" : "Stability AI",
        imagePrompt: validationResult.metadata.promptUsed ?? originalPrompt,
        appropriatenessScore: validationResult.metadata.appropriatenessScore,
        appropriatenessReasoning: validationResult.metadata.validationReasoning,
        imageSource: provider === "openai" ? "OpenAI DALL-E 3" : "Stability AI",
        timing: {
          total: endTime - startTime,
          fetch: fetchEnd - fetchStart,
          validation: endTime - validationStart,
        },
      };
    } catch (error) {
      console.error("Error regenerating image:", error);
      throw error;
    }
  };

  const validateSingleImage = async (
    imageUrl: string,
    prompt: string,
    imageWasGenerated: boolean,
    originalPrompt: string,
  ): Promise<ValidationResult> => {
    try {
      if (
        !pageData?.title ||
        !pageData?.keyStage ||
        !pageData?.subject ||
        !pageData?.lessonPlan
      ) {
        throw new Error("Missing required page data for validation");
      }

      const validationResult = await validateImageMutation.mutateAsync({
        imageUrl,
        prompt,
        lessonTitle: pageData.title,
        keyStage: pageData.keyStage,
        subject: pageData.subject,
        lessonPlan: pageData.lessonPlan,
        imageWasGenerated,
        originalPrompt,
      });

      return validationResult;
    } catch (error) {
      console.error("Image validation error:", error);
      throw error;
    }
  };

  const fetchImages = async (
    source: string,
    prompt: string,
    originalPrompt: string,
  ): Promise<ImageResponse[]> => {
    const startTime = performance.now();

    try {
      if (!prompt) {
        throw new Error("Search prompt is required");
      }

      if (
        !pageData?.title ||
        !pageData?.keyStage ||
        !pageData?.subject ||
        !pageData?.lessonPlan
      ) {
        throw new Error("Missing required page data");
      }

      if (!trpcMutations[source]) {
        throw new Error("Invalid image source selected");
      }

      const mutation = trpcMutations[source];
      const fetchStart = performance.now();
      const response = await mutation.mutateAsync({
        searchExpression: prompt,
        lessonTitle: pageData.title,
        subject: pageData.subject,
        keyStage: pageData.keyStage,
        lessonPlan: pageData.lessonPlan,
        originalPrompt: originalPrompt,
      });

      const fetchEnd = performance.now();

      // Custom Pipeline already includes validation
      if (source === "Custom Pipeline Show all with Reasoning") {
        const endTime = performance.now();
        return (response as ImageResponse[]).map((image) => ({
          ...image,
          timing: {
            total: endTime - startTime,
            fetch: fetchEnd - fetchStart,
            validation: 0,
          },
        }));
      }

      // Handle Stable Diffusion variants
      if (
        source === "Stable Diffusion Ultra" ||
        source === "Stable Diffusion 3.0 & 3.5" ||
        source === "Stable Diffusion Core"
      ) {
        const validationStart = performance.now();
        const validationResult = await validateSingleImage(
          response as string,
          prompt,
          true,
          originalPrompt,
        );
        const endTime = performance.now();

        return [
          {
            id: "1",
            url: response as string,
            license: "Stable Diffusion",
            appropriatenessScore:
              validationResult.metadata.appropriatenessScore,
            appropriatenessReasoning:
              validationResult.metadata.validationReasoning,
            imageSource: source,
            imagePrompt: validationResult.metadata.promptUsed ?? "No prompt",
            timing: {
              total: endTime - startTime,
              fetch: fetchEnd - fetchStart,
              validation: endTime - validationStart,
            },
          },
        ];
      }

      // Handle DALL-E
      if (source === "DAL-E") {
        const validationStart = performance.now();
        const daleValidation = await validateSingleImage(
          response as string,
          prompt,
          true,
          originalPrompt,
        );
        const endTime = performance.now();

        return [
          {
            id: "1",
            url: response as string,
            license: "OpenAI",
            imagePrompt: daleValidation.metadata.promptUsed ?? prompt,
            appropriatenessScore: daleValidation.metadata.appropriatenessScore,
            appropriatenessReasoning:
              daleValidation.metadata.validationReasoning,
            imageSource: source,
            timing: {
              total: endTime - startTime,
              fetch: fetchEnd - fetchStart,
              validation: endTime - validationStart,
            },
          },
        ];
      }

      // Handle Cloudinary
      if (source === "Cloudinary") {
        const cloudinaryData = (response as ImagesFromCloudinary).resources.map(
          (image) => ({
            id: image.public_id,
            url: image.url,
            license: "Cloudinary",
            imagePrompt: prompt,
          }),
        );

        const validationStart = performance.now();
        const validatedImages = await validateImagesInParallel.mutateAsync({
          images: cloudinaryData,
          searchExpression: prompt,
          lessonTitle: pageData.title,
          subject: pageData.subject,
          keyStage: pageData.keyStage,
          lessonPlan: pageData.lessonPlan,
          originalPrompt,
        });
        const endTime = performance.now();

        return cloudinaryData.map((image, index) => {
          const validation = validatedImages[index]?.validationResult;
          return {
            id: image.id,
            url: image.url,
            license: "Cloudinary",
            imagePrompt: prompt,
            appropriatenessScore:
              validation?.metadata.appropriatenessScore ?? 0,
            appropriatenessReasoning:
              validation?.metadata.validationReasoning ?? "",
            imageSource: source,
            timing: {
              total: endTime - startTime,
              fetch: fetchEnd - fetchStart,
              validation: endTime - validationStart,
            },
          };
        });
      }

      // Handle array responses (Flickr, Unsplash, etc.)
      if (Array.isArray(response)) {
        const imageResponses = response as ImageResponse[];
        const validationStart = performance.now();
        const validatedImages = await validateImagesInParallel.mutateAsync({
          images: imageResponses,
          searchExpression: prompt,
          lessonTitle: pageData.title,
          subject: pageData.subject,
          keyStage: pageData.keyStage,
          lessonPlan: pageData.lessonPlan,
          originalPrompt,
        });
        const endTime = performance.now();

        return imageResponses.map((image, index) => {
          const validation = validatedImages[index]?.validationResult;
          if (!validation) {
            return {
              ...image,
              appropriatenessScore: 0,
              appropriatenessReasoning: "Validation failed",
              imagePrompt: prompt,
              imageSource: source,
              timing: {
                total: endTime - startTime,
                fetch: fetchEnd - fetchStart,
                validation: endTime - validationStart,
              },
            };
          }

          return {
            ...image,
            appropriatenessScore: validation.metadata.appropriatenessScore,
            appropriatenessReasoning: validation.metadata.validationReasoning,
            imagePrompt: prompt,
            imageSource: source,
            timing: {
              total: endTime - startTime,
              fetch: fetchEnd - fetchStart,
              validation: endTime - validationStart,
            },
          };
        });
      }

      // Handle single image response
      if (response && typeof response === "object") {
        const singleImage = response as ImageResponse;
        const validationStart = performance.now();
        const validation = await validateSingleImage(
          singleImage.url,
          prompt,
          false,
          originalPrompt,
        );
        const endTime = performance.now();

        return [
          {
            ...singleImage,
            appropriatenessScore: validation.metadata.appropriatenessScore,
            appropriatenessReasoning: validation.metadata.validationReasoning,
            imagePrompt: prompt,
            imageSource: source,
            timing: {
              total: endTime - startTime,
              fetch: fetchEnd - fetchStart,
              validation: endTime - validationStart,
            },
          },
        ];
      }

      throw new Error("Unexpected response format from image source");
    } catch (error) {
      console.error(`Error fetching images from ${source}:`, error);
      throw new Error(`Failed to fetch images from ${source}: ${error}`);
    }
  };

  return {
    fetchImages,
    availableSources: trpcMutations,
    regenerateImageWithAnalysis,
  };
};
