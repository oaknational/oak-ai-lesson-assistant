import { useCallback } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import type { TypesOfImage } from "@oakai/api/src/router/imageCategoriser";
import type { ImageCycle } from "@oakai/api/src/router/imageGen";

import { trpc } from "@/utils/trpc";

type PageData = {
  title: string | undefined;
  subject: string | undefined;
  keyStage: string | undefined;
  lessonPlan: LooseLessonPlan;
};

const useGetImages = ({
  cycleNumber,
  cycle,
  pageData,
}: {
  cycleNumber: 1 | 2 | 3;
  cycle: ImageCycle;
  pageData: PageData;
}) => {
  const {
    data: imageCategory,
    isLoading: imageCategoryLoading,
    mutateAsync: categoriseImageMutateAsync,
  } = trpc.imageCategoriser.imageCategoriser.useMutation();

  const {
    data: newImagePrompt,
    isLoading: newPromptLoading,
    mutateAsync: generateImagePrompt,
  } = trpc.imageCategoriser.createPhotoRealisticImagePrompt.useMutation();

  const {
    data: cycleImagesFromAilaPrompt,
    isLoading: cycleImagesFromAilaPromptLoading,
    mutateAsync: ailaPromptImagesMutateAsync,
  } = trpc.imageGen.generateFourImages.useMutation();

  const {
    data: cycleImagesFromAgentPrompt,
    isLoading: cycleImagesFromAgentPromptLoading,
    mutateAsync: agentPromptImagesMutateAsync,
  } = trpc.imageGen.generateFourImages.useMutation();

  const {
    data: promptCopyrightCheck,
    isLoading: promptCopyrightCheckLoading,
    mutateAsync: promptCopyrightCheckMutateAsync,
  } = trpc.imageCategoriser.promptCopyrightCheck.useMutation();

  const sources = [
    "cloudinary",
    "unsplash",
    "dale",
    "stable",
    "stableUltra",
    "wiki",
  ];

  const allAilaPromptImagesSortedByRelavanceScore = sources
    .flatMap((source) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (cycleImagesFromAilaPrompt?.[source] || []).map((image) => ({
        ...image,
        source,
      })),
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .sort((a, b) => b.appropriatenessScore - a.appropriatenessScore);

  const allAgentPromptImagesSortedByRelavanceScore = sources
    .flatMap((source) =>
      (cycleImagesFromAgentPrompt?.[source] || []).map((image) => ({
        ...image,
        source,
      })),
    )
    .sort((a, b) => b.appropriatenessScore - a.appropriatenessScore);

  const categoriseImage = useCallback(async () => {
    try {
      await categoriseImageMutateAsync({
        lessonPlan: pageData.lessonPlan,
        lessonTitle: pageData.title as string,
        subject: pageData.subject as string,
        keyStage: pageData.keyStage as string,
        cycle: cycleNumber,
        searchExpression:
          cycle?.explanation?.imageSearch ||
          cycle?.explanation?.imagePrompt ||
          "",
      });
    } catch (error) {
      console.error("Error while categorising image", error);
      throw error;
    }
  }, [
    categoriseImageMutateAsync,
    cycle?.explanation?.imagePrompt,
    cycle?.explanation?.imageSearch,
    cycleNumber,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  const generateImagesFromAgentPrompt = useCallback(
    async ({ imageCategory }: { imageCategory: TypesOfImage }) => {
      try {
        let newImagePrompt;
        const searchExpression =
          cycle?.explanation?.imageSearch || cycle?.explanation?.imagePrompt;

        console.log("The image category is: ", imageCategory);

        if (imageCategory === "PHOTO_REALISTIC") {
          const data = await generateImagePrompt({
            lessonPlan: pageData.lessonPlan,
            lessonTitle: pageData.title as string,
            subject: pageData.subject as string,
            keyStage: pageData.keyStage as string,
            cycle: cycleNumber,
            searchExpression: searchExpression ?? "",
          });
          newImagePrompt = data;
          console.log("The new image prompt is: ", newImagePrompt);
        }

        const isCopyrightFree = await promptCopyrightCheckMutateAsync({
          lessonPlan: pageData.lessonPlan,
          lessonTitle: pageData.title as string,
          subject: pageData.subject as string,
          keyStage: pageData.keyStage as string,
          cycle: cycleNumber,
          prompt: newImagePrompt,
          searchExpression: searchExpression ?? "",
        });

        if (isCopyrightFree.copyright) {
          throw new Error("Prompt is copyrighted");
        } else {
          await agentPromptImagesMutateAsync({
            searchExpression: searchExpression ?? "",
            lessonTitle: pageData.title as string,
            subject: pageData.subject as string,
            keyStage: pageData.keyStage as string,
            lessonPlan: pageData.lessonPlan,
            originalPrompt: cycle?.explanation?.imagePrompt ?? "",
            agentImagePrompt: newImagePrompt,
            imageCategory: imageCategory,
          });
          console.log("Images generated from agent prompt");
        }

        console.log("Images generated from agent prompt");
      } catch (e) {
        console.error("Error while generating images from agent prompt", e);
        throw e;
      }
    },
    [
      agentPromptImagesMutateAsync,
      cycle?.explanation?.imagePrompt,
      cycle?.explanation?.imageSearch,
      cycleNumber,
      generateImagePrompt,
      pageData.keyStage,
      pageData.lessonPlan,
      pageData.subject,
      pageData.title,
      promptCopyrightCheckMutateAsync,
    ],
  );

  return {
    newImagePrompt,
    newPromptLoading,
    cycleImagesFromAilaPrompt,
    cycleImagesFromAilaPromptLoading,
    cycleImagesFromAgentPrompt,
    cycleImagesFromAgentPromptLoading,
    allAilaPromptImagesSortedByRelavanceScore,
    allAgentPromptImagesSortedByRelavanceScore,
    // generateImagesFromAilaPrompt,
    generateImagesFromAgentPrompt,
    categoriseImage,
    imageCategory,
    imageCategoryLoading,
    promptCopyrightCheck,
    promptCopyrightCheckLoading,
  };
};

export default useGetImages;
