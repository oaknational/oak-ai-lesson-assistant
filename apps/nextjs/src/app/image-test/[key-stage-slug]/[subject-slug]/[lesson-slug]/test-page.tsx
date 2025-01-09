"use client";

import { useEffect, useState } from "react";

import { chatSchema } from "@oakai/aila/src/protocol/schema";
import type { Prisma } from "@prisma/client";
import { useImageSearch } from "hooks/useImageSearch";
import type { ImageResponse, PageData } from "types/imageTypes";

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

  useEffect(() => {
    cycle1MutateAsync({
      searchExpression: cycle1ImagePrompt as string,
      lessonTitle: pageData.title as string,
      subject: pageData.subject as string,
      keyStage: pageData.keyStage as string,
      lessonPlan: pageData.lessonPlan,
      originalPrompt: cycle1ImagePrompt as string,
    });
    cycle2MutateAsync({
      searchExpression: cycle2ImagePrompt as string,
      lessonTitle: pageData.title as string,
      subject: pageData.subject as string,
      keyStage: pageData.keyStage as string,
      lessonPlan: pageData.lessonPlan,
      originalPrompt: cycle2ImagePrompt as string,
    });
    cycle3MutateAsync({
      searchExpression: cycle3ImagePrompt as string,
      lessonTitle: pageData.title as string,
      subject: pageData.subject as string,
      keyStage: pageData.keyStage as string,
      lessonPlan: pageData.lessonPlan,
      originalPrompt: cycle3ImagePrompt as string,
    });
  }, [
    cycle1ImagePrompt,
    cycle1MutateAsync,
    pageData.keyStage,
    pageData.lessonPlan,
    pageData.subject,
    pageData.title,
    cycle2ImagePrompt,
    cycle2MutateAsync,
    cycle3ImagePrompt,
    cycle3MutateAsync,
  ]);

  return (
    <div className="mx-auto max-w-[1600px] p-19">
      <h1 className="mb-11 text-3xl font-bold">{lessonOutput.title}</h1>
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
              // @ts-ignore
              <Cycle cycle={cycle1} cycleImages={cycle1Images} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold">Cycle 2</h2>
            {cycle2Loading ? (
              <LoadingWheel />
            ) : (
              // @ts-ignore
              <Cycle cycle={cycle2} cycleImages={cycle2Images} />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Cycle 3</h2>
            {cycle3Loading ? (
              <LoadingWheel />
            ) : (
              // @ts-ignore
              <Cycle cycle={cycle3} cycleImages={cycle3mages} />
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
    </div>
  );
};

const Cycle = ({
  cycle,
  cycleImages,
}: {
  cycle: any;
  cycleImages?: CycleData | undefined;
}) => {
  return (
    <>
      <div className="flex flex-col gap-8">
        <p>{cycle.title}</p>
        Spoken explanation:
        <br />{" "}
        {Array.isArray(cycle.explanation?.spokenExplanation) &&
          cycle.explanation?.spokenExplanation?.map((slide) => slide)}
        <p>
          Accompanying slide details:
          <br /> {cycle?.explanation?.accompanyingSlideDetails}
        </p>
        <p>
          Image prompt:
          <br /> {cycle?.explanation?.imagePrompt}
        </p>
        <p>
          Slide text:
          <br /> {cycle?.explanation?.slideText}
        </p>
        <p>
          Practise:
          <br /> {cycle.practice}
        </p>
        <p>
          Feedback:
          <br /> {cycle.feedback}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-8">
        <div>
          <h3>Cloudinary</h3>
          {cycleImages?.cloudinary.map((image) => (
            <div key={image.id}>
              <img src={image.url} alt={image.alt} />
              <p>Relevance score judged by ai: {image.appropriatenessScore}</p>
            </div>
          ))}
        </div>
        <div>
          <h3>Unsplash</h3>
          {cycleImages?.unsplash.map((image) => (
            <div key={image.id}>
              <img src={image.url} alt={image.alt} />
              <p>Relevance score judged by ai: {image.appropriatenessScore}</p>
            </div>
          ))}
        </div>
        <div>
          <h3>Dale (AI)</h3>
          {cycleImages?.dale.map((image) => (
            <div key={image.id}>
              <img src={image.url} alt={image.alt} />
              <p>Relevance score judged by ai: {image.appropriatenessScore}</p>
            </div>
          ))}
        </div>
        <div>
          <h3>Stable (AI)</h3>
          {cycleImages?.stable.map((image) => (
            <div key={image.id}>
              <img src={image.url} alt={image.alt} />
              <p>Relevance score judged by ai: {image.appropriatenessScore}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ImageTestPage;
