"use client";

import { useCallback, useEffect, useState } from "react";

import {
  chatSchema,
  LessonPlanSchemaWhilstStreaming,
} from "@oakai/aila/src/protocol/schema";
import type { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { PageData } from "src/types/imageTypes";
import { z } from "zod";

import { Loading } from "@/components/AppComponents/Chat/chat-lessonPlanDisplay.stories";
import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

export interface CycleData {
  cloudinary: Cloudinary[];
  unsplash: Unsplash[];
  dale: Dale[];
  stable: Stable[];
}

export interface Cloudinary {
  id: string;
  url: string;
  title: string;
  alt: string;
  license: string;
  photographer: string;
  appropriatenessScore: number;
  appropriatenessReasoning: string;
  imagePrompt: string;
}

export interface Unsplash {
  id: string;
  url: string;
  photographer: string;
  license: string;
  alt: string;
  title: string;
  appropriatenessScore: number;
  appropriatenessReasoning: string;
  imagePrompt: string;
}

export interface Dale {
  id: string;
  url: string;
  title: string;
  alt: string;
  license: string;
  photographer: string;
  appropriatenessScore: number;
  appropriatenessReasoning: string;
  imagePrompt: string;
}

export interface Stable {
  id: string;
  url: string;
  title: string;
  alt: string;
  license: string;
  photographer: string;
  appropriatenessScore: number;
  appropriatenessReasoning: string;
  imagePrompt: string;
}

const ImageTestPage = ({
  lesson,
  pageData,
}: {
  pageData: PageData;
  lesson: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    appId: string;
    userId: string;
    output: Prisma.JsonValue;
  } | null;
}) => {
  const [seeLessonInfo, setSeeLessonInfo] = useState(false);
  if (!lesson) {
    return null;
  }

  const parseOutput = chatSchema.parse(lesson.output);
  lesson;
  const lessonOutput = parseOutput.lessonPlan;
  // @ts-ignore
  const { checkForUnderstanding, ...cycle1 } = lessonOutput.cycle1;
  // @ts-ignore
  const { checkForUnderstanding: checkForUnderstandingCycle2, ...cycle2 } =
    lessonOutput.cycle2;
  // @ts-ignore
  const { checkForUnderstanding: checkForUnderstandingCycle3, ...cycle3 } =
    lessonOutput.cycle3;
  const cycle1ImagePrompt = cycle1?.explanation?.imagePrompt;
  const cycle2ImagePrompt = cycle2?.explanation?.imagePrompt;
  const cycle3ImagePrompt = cycle3?.explanation?.imagePrompt;

  const {
    data: cycle1Images,
    isLoading: cycle1Loading,
    mutateAsync: cycle1MutateAsync,
  } = trpc.imageGen.generateFourImages.useMutation();

  const {
    data: cycle2Images,
    isLoading: cycle2Loading,
    mutateAsync: cycle2MutateAsync,
  } = trpc.imageGen.generateFourImages.useMutation();

  const {
    data: cycle3mages,
    isLoading: cycle3Loading,
    mutateAsync: cycle3MutateAsync,
  } = trpc.imageGen.generateFourImages.useMutation();

  const {
    data: imagePromptFromImagePromptAgent,
    isLoading: imagePromptLoading,
    mutateAsync: imagePromptMutateAsync,
  } = trpc.imageGen.createImagePrompt.useMutation();

  const generateImagePrompt = useCallback(
    ({ cycle }: { cycle: 1 | 2 | 3 }) => {
      try {
        imagePromptMutateAsync({
          lessonTitle: pageData.title as string,
          subject: pageData.subject as string,
          keyStage: pageData.keyStage as string,
          lessonPlan: pageData.lessonPlan,
          cycle,
        });
      } catch (error) {
        console.error("callback error:", error);
        throw error;
      }
    },
    [
      imagePromptMutateAsync,
      pageData.keyStage,
      pageData.lessonPlan,
      pageData.subject,
      pageData.title,
    ],
  );

  const generateCycle1 = useCallback(() => {
    try {
      cycle1MutateAsync({
        searchExpression: cycle1ImagePrompt,
        lessonTitle: pageData.title as string,
        subject: pageData.subject as string,
        keyStage: pageData.keyStage as string,
        lessonPlan: pageData.lessonPlan,
        originalPrompt: cycle1ImagePrompt,
      });
    } catch (error) {
      console.error("callback error:", error);
      throw error;
    }
  }, [
    cycle1ImagePrompt,
    cycle1MutateAsync,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  const generateCycle2 = useCallback(() => {
    try {
      cycle2MutateAsync({
        searchExpression: cycle2ImagePrompt,
        lessonTitle: pageData.title as string,
        subject: pageData.subject as string,
        keyStage: pageData.keyStage as string,
        lessonPlan: pageData.lessonPlan,
        originalPrompt: cycle2ImagePrompt,
      });
    } catch (error) {
      console.error("callback error:", error);
      throw error;
    }
  }, [
    cycle2ImagePrompt,
    cycle2MutateAsync,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  const generateCycle3 = useCallback(() => {
    try {
      cycle3MutateAsync({
        searchExpression: cycle3ImagePrompt,
        lessonTitle: pageData.title as string,
        subject: pageData.subject as string,
        keyStage: pageData.keyStage as string,
        lessonPlan: pageData.lessonPlan,
        originalPrompt: cycle3ImagePrompt,
      });
    } catch (error) {
      console.error("callback error:", error);
      throw error;
    }
  }, [
    cycle3ImagePrompt,
    cycle3MutateAsync,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  const generateEverything = useCallback(() => {
    try {
      generateCycle1();
      generateCycle2();
      generateCycle3();
    } catch (error) {
      console.error("callback error:", error);
    }
  }, [generateCycle1, generateCycle2, generateCycle3]);

  const [hasClickedLoad, setHasClickedLoad] = useState(false);
  return (
    <div className="mx-auto max-w-[1600px] p-19">
      <div className="mb-11">
        <Link href="/image-test">{`<- Back to start`}</Link>
      </div>
      <h1 className="mb-11 text-3xl font-bold">{lessonOutput.title}</h1>
      {true ? (
        <div className="flex flex-row gap-20">
          <div className="flex w-[70%] flex-col gap-16 rounded bg-gray-100 p-9">
            <div>
              {(cycle1Loading || cycle2Loading || cycle3Loading) && (
                <p className="font-bold">Loading this might take a few mins</p>
              )}
              <h2 className="text-2xl font-bold">Cycle 1</h2>
              {cycle1Loading ? (
                <LoadingWheel />
              ) : (
                <Cycle
                  cycle={cycle1}
                  // @ts-ignore
                  cycleImages={cycle1Images}
                  generateImagePrompt={generateImagePrompt}
                  cycleNumber={1}
                  newImagePrompt={imagePromptFromImagePromptAgent}
                  pageData={pageData}
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold">Cycle 2</h2>
              {cycle2Loading ? (
                <LoadingWheel />
              ) : (
                <Cycle
                  cycle={cycle2}
                  // @ts-ignore
                  cycleImages={cycle2Images}
                  generateImagePrompt={generateImagePrompt}
                  cycleNumber={2}
                  newImagePrompt={imagePromptFromImagePromptAgent}
                  pageData={pageData}
                />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Cycle 3</h2>
              {cycle3Loading ? (
                <LoadingWheel />
              ) : (
                <Cycle
                  cycle={cycle3}
                  // @ts-ignore
                  cycleImages={cycle3mages}
                  generateImagePrompt={generateImagePrompt}
                  cycleNumber={3}
                  newImagePrompt={imagePromptFromImagePromptAgent}
                  pageData={pageData}
                />
              )}
            </div>
          </div>
          <div className="w-[30%]">
            <button
              onClick={() => {
                setSeeLessonInfo(!seeLessonInfo);
              }}
            >
              {seeLessonInfo ? "Hide Lesson Info" : "See Lesson Info"}
            </button>
            {seeLessonInfo && (
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {JSON.stringify(lessonOutput, null, 2)}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <button
          className="rounded bg-blue px-4 py-2 font-bold text-white hover:opacity-80"
          onClick={() => {
            // generateEverything();
            setHasClickedLoad(true);
          }}
        >
          Load images
        </button>
      )}
    </div>
  );
};

const Cycle = ({
  cycle,
  cycleNumber,
  pageData,
}: {
  cycle: any;
  cycleNumber: 1 | 2 | 3;
  pageData: PageData;
}) => {
  const {
    data: newImagePrompt,
    isLoading: newPromptLoading,
    mutateAsync: generateImagePrompt,
  } = trpc.imageGen.createImagePrompt.useMutation();

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

  const sources = ["cloudinary", "unsplash", "dale", "stable"];

  const allAilaPromptImagesSortedByRelavanceScore = sources
    .flatMap((source) =>
      (cycleImagesFromAilaPrompt?.[source] || []).map((image) => ({
        ...image,
        source,
      })),
    )
    .sort((a, b) => b.appropriatenessScore - a.appropriatenessScore);

  const allAgentPromptImagesSortedByRelavanceScore = sources
    .flatMap((source) =>
      (cycleImagesFromAgentPrompt?.[source] || []).map((image) => ({
        ...image,
        source,
      })),
    )
    .sort((a, b) => b.appropriatenessScore - a.appropriatenessScore);

  const handleGeneratePrompt = useCallback(() => {
    generateImagePrompt({
      lessonTitle: pageData.title ?? "",
      subject: pageData.subject ?? "",
      keyStage: pageData.keyStage ?? "",
      lessonPlan: pageData.lessonPlan ?? "",
      cycle: cycleNumber,
    });
  }, [generateImagePrompt, pageData, cycleNumber]);

  const generateImagesFromAilaPrompt = useCallback(() => {
    ailaPromptImagesMutateAsync({
      searchExpression: cycle.explanation.imageSearch,
      lessonTitle: pageData.title as string,
      subject: pageData.subject as string,
      keyStage: pageData.keyStage as string,
      lessonPlan: pageData.lessonPlan,
      originalPrompt: cycle.explanation.imagePrompt,
    });
  }, [
    ailaPromptImagesMutateAsync,
    cycle.explanation.imagePrompt,
    cycleNumber,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  const generateImagesFromAgentPrompt = useCallback(() => {
    agentPromptImagesMutateAsync({
      searchExpression: cycle.explanation.imageSearch,
      lessonTitle: pageData.title as string,
      subject: pageData.subject as string,
      keyStage: pageData.keyStage as string,
      lessonPlan: pageData.lessonPlan,
      originalPrompt: cycle.explanation.imagePrompt,
      agentImagePrompt: newImagePrompt,
    });
  }, [
    agentPromptImagesMutateAsync,
    cycle.explanation.imagePrompt,
    cycleNumber,
    newImagePrompt,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
  ]);

  return (
    <div className="flex flex-col gap-8">
      <p className="my-8 text-lg font-bold">{cycle?.title}</p>
      <b>Explanation:</b>
      <div className="flex flex-col gap-5">
        {Array.isArray(cycle?.explanation?.spokenExplanation) &&
          cycle?.explanation.spokenExplanation.map((slide) => (
            <p key={slide}>- {slide}</p>
          ))}
      </div>
      <p>
        <b>Image prompt from aila:</b>
        <br /> {cycle?.explanation?.imagePrompt}
      </p>
      {newImagePrompt ? (
        <p>
          <b>New Image Prompt:</b>
          <br /> {cleanPrompt(newImagePrompt)}
        </p>
      ) : (
        <div className="my-7 flex justify-start">
          <button
            className="rounded bg-blue px-4 py-2 font-bold text-white hover:opacity-80"
            onClick={handleGeneratePrompt}
          >
            Generate a new prompt from agent
          </button>
          {newPromptLoading && <LoadingWheel />}
        </div>
      )}

      {newImagePrompt && (
        <>
          <h3 className="font-bold">Images</h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Aila Prompt Images */}
            <div className="w-full">
              <h4 className="font-bold">Images from Aila prompt</h4>
              {allAilaPromptImagesSortedByRelavanceScore.length > 0 ? (
                allAilaPromptImagesSortedByRelavanceScore.map((image) => (
                  <div key={image.id} className="mb-4">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      objectFit="contain"
                      width="400"
                      height="400"
                    />
                    <p>Score: {image.appropriatenessScore}</p>
                    <p>Source: {image.source}</p>
                  </div>
                ))
              ) : (
                <>
                  <button
                    className="rounded bg-blue px-4 py-2 font-bold text-white hover:opacity-80"
                    onClick={generateImagesFromAilaPrompt}
                  >
                    Generate images from Aila prompt
                  </button>
                  {cycleImagesFromAilaPromptLoading && <LoadingWheel />}
                </>
              )}
            </div>

            {/* Agent Prompt Images */}
            <div className="w-full">
              <h4 className="font-bold">Images from Agent prompt</h4>
              {allAgentPromptImagesSortedByRelavanceScore.length > 0 ? (
                allAgentPromptImagesSortedByRelavanceScore.map((image) => (
                  <div key={image.id} className="mb-4">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      objectFit="contain"
                      width="400"
                      height="400"
                    />
                    <p>Score: {image.appropriatenessScore}</p>
                    <p>Source: {image.source}</p>
                  </div>
                ))
              ) : (
                <>
                  <button
                    className="rounded bg-blue px-4 py-2 font-bold text-white hover:opacity-80"
                    onClick={generateImagesFromAgentPrompt} // ✅ Fixed button action
                  >
                    Generate images from Agent prompt
                  </button>
                  {cycleImagesFromAgentPromptLoading && <LoadingWheel />}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function cleanPrompt(prompt: string) {
  if (prompt.startsWith("DIAGRAM_PROMPT:")) {
    return prompt.split("DIAGRAM_PROMPT:")[1];
  }
  if (prompt.startsWith("PHOTO_REALISTIC_PROMPT:")) {
    return prompt.split("PHOTO_REALISTIC_PROMPT:")[1];
  }
  return prompt;
}

export default ImageTestPage;
