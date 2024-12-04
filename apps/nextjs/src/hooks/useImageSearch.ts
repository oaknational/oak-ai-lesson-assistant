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

  const validateSingleImage = async (
    imageUrl: string,
    prompt: string,
    imageWasGenerated: boolean,
  ): Promise<ValidationResult> => {
    const validationResult = await validateImageMutation.mutateAsync({
      imageUrl,
      prompt,
      lessonTitle: pageData.title ?? "",
      keyStage: pageData.keyStage ?? "",
      subject: pageData.subject ?? "",
      lessonPlan: pageData.lessonPlan,
      imageWasGenerated,
    });

    return validationResult;
  };

  const fetchImages = async (
    source: string,
    prompt: string,
  ): Promise<ImageResponse[]> => {
    const startTime = performance.now();

    if (!trpcMutations[source]) {
      throw new Error("Invalid image source selected.");
    }

    const mutation = trpcMutations[source];
    const fetchStart = performance.now();
    const response = await mutation.mutateAsync({
      searchExpression: prompt,
      lessonTitle: pageData.title ?? "",
      subject: pageData.subject ?? "",
      keyStage: pageData.keyStage ?? "",
      lessonPlan: pageData.lessonPlan,
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
          validation: 0, // Custom pipeline includes validation
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
      );
      const endTime = performance.now();

      return [
        {
          id: "1",
          url: response as string,
          license: "Stable Diffusion",
          appropriatenessScore: validationResult.metadata.appropriatenessScore,
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
      );
      const endTime = performance.now();

      return [
        {
          id: "1",
          url: response as string,
          license: "OpenAI",
          imagePrompt: daleValidation.metadata.promptUsed ?? prompt,
          appropriatenessScore: daleValidation.metadata.appropriatenessScore,
          appropriatenessReasoning: daleValidation.metadata.validationReasoning,
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
        lessonTitle: pageData.title ?? "",
        subject: pageData.subject ?? "",
        keyStage: pageData.keyStage ?? "",
        lessonPlan: pageData.lessonPlan,
      });
      const endTime = performance.now();

      return cloudinaryData.map((image, index) => {
        const validation = validatedImages[index]?.validationResult;
        return {
          id: image.id,
          url: image.url,
          license: "Cloudinary",
          imagePrompt: prompt,
          appropriatenessScore: validation?.metadata.appropriatenessScore ?? 0,
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
        lessonTitle: pageData.title ?? "",
        subject: pageData.subject ?? "",
        keyStage: pageData.keyStage ?? "",
        lessonPlan: pageData.lessonPlan,
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
  };

  return {
    fetchImages,
    availableSources: trpcMutations,
  };
};
