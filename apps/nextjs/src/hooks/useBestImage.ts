import { useState, useCallback } from "react";

import type { PageData, ValidatedImage } from "types/imageTypes";

import { trpc } from "@/utils/trpc";

interface BestImageHookProps {
  pageData: PageData;
  originalPrompt: string;
}

interface BestImageState {
  data: ValidatedImage | null | undefined;
  status: string;
}

export const useBestImage = ({
  pageData,
  originalPrompt,
}: BestImageHookProps) => {
  const [bestImage, setBestImage] = useState<BestImageState | null>(null);

  const cloudinaryMutation =
    trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation();
  const flickrMutation = trpc.imageSearch.getImagesFromFlickr.useMutation();
  const unsplashMutation = trpc.imageSearch.getImagesFromUnsplash.useMutation();
  const stableDiffusionCoreMutation = trpc.imageGen.stableDifCore.useMutation();
  const daleMutation = trpc.imageGen.openAi.useMutation();
  const validateImagesInParallel =
    trpc.imageGen.validateImagesInParallel.useMutation();

  const updateStatus = useCallback((status: string) => {
    console.log("[Status Update]:", status);
    setBestImage((prev) => ({
      data: prev?.data,
      status,
    }));
  }, []);

  const findBestImage = useCallback(
    async (prompt: string) => {
      updateStatus("Searching Flickr, Cloudinary and unsplash...");

      try {
        // Search free image sources
        const [flickrImages, unsplashImages] = await Promise.all([
          flickrMutation.mutateAsync({ searchExpression: prompt }),
          unsplashMutation.mutateAsync({ searchExpression: prompt }),
        ]);

        const allSearchImages = [...flickrImages, ...unsplashImages];

        const validateAllSearchImages =
          await validateImagesInParallel.mutateAsync({
            images: allSearchImages,
            searchExpression: prompt,
            lessonTitle: pageData.title ?? "",
            subject: pageData.subject ?? "",
            keyStage: pageData.keyStage ?? "",
            lessonPlan: pageData.lessonPlan,
            originalPrompt: originalPrompt,
          });

        let validImages = validateAllSearchImages.filter(
          (image) => image.validationResult.isValid,
        );

        // Try Stable Diffusion if needed
        if (validImages.length < 1) {
          updateStatus("Generating image using Stable Diffusion Core...");
          const stableDiffusionUrl =
            await stableDiffusionCoreMutation.mutateAsync({
              searchExpression: prompt,
              lessonTitle: pageData.title ?? "",
              subject: pageData.subject ?? "",
              keyStage: pageData.keyStage ?? "",
              lessonPlan: pageData.lessonPlan,
              originalPrompt: originalPrompt,
            });

          const sdValidation = await validateImagesInParallel.mutateAsync({
            images: [
              {
                id: "1",
                url: stableDiffusionUrl,
                license: "Stable Diffusion Core",
              },
            ],
            searchExpression: prompt,
            lessonTitle: pageData.title ?? "",
            subject: pageData.subject ?? "",
            keyStage: pageData.keyStage ?? "",
            lessonPlan: pageData.lessonPlan,
            originalPrompt: originalPrompt,
          });

          validImages = [
            ...validImages,
            ...sdValidation.filter((image) => image.validationResult.isValid),
          ];
        }

        // Try DALL-E as last resort
        if (validImages.length < 1) {
          updateStatus("Generating image using DAL-E...");
          const daleUrl = await daleMutation.mutateAsync({
            searchExpression: prompt,
            lessonTitle: pageData.title ?? "",
            subject: pageData.subject ?? "",
            keyStage: pageData.keyStage ?? "",
            lessonPlan: pageData.lessonPlan,
            originalPrompt: originalPrompt,
          });

          const daleValidation = await validateImagesInParallel.mutateAsync({
            images: [
              {
                id: "1",
                url: daleUrl,
                license: "OpenAI",
              },
            ],
            searchExpression: prompt,
            lessonTitle: pageData.title ?? "",
            subject: pageData.subject ?? "",
            keyStage: pageData.keyStage ?? "",
            lessonPlan: pageData.lessonPlan,
            originalPrompt: originalPrompt,
          });

          validImages = [
            ...validImages,
            ...daleValidation.filter((image) => image.validationResult.isValid),
          ];
        }

        // Sort and select best image
        if (validImages.length > 1) {
          validImages.sort(
            (a, b) =>
              b.validationResult.metadata.appropriatenessScore -
              a.validationResult.metadata.appropriatenessScore,
          );
        }

        const finalAnswer = validImages.length > 0 ? validImages[0] : null;

        setBestImage({
          data: finalAnswer
            ? {
                ...finalAnswer,
                imageData: {
                  ...finalAnswer.imageData,
                  imagePrompt: finalAnswer.imageData.imagePrompt ?? "",
                  timing: finalAnswer.imageData.timing ?? {
                    total: 0,
                    fetch: 0,
                    validation: 0,
                  },
                },
              }
            : null,
          status: finalAnswer
            ? "The best image has been found!"
            : "No appropriate images found.",
        });

        return finalAnswer;
      } catch (error) {
        console.error("[Error] Error in findBestImage:", error);
        setBestImage({
          data: null,
          status: "An error occurred while searching for images.",
        });
        return null;
      }
    },
    [
      flickrMutation,
      unsplashMutation,
      validateImagesInParallel,
      stableDiffusionCoreMutation,
      daleMutation,
      pageData,
      updateStatus,
    ],
  );

  return {
    bestImage,
    findBestImage,
  };
};
