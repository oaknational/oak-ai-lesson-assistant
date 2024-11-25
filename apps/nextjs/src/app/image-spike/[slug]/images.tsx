"use client";

import { useCallback, useState } from "react";

import type { ImagesFromCloudinary } from "ai-apps/image-alt-generation/types";
import Link from "next/link";
import { z } from "zod";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

export interface PageData {
  id: string;
  path: string;
  title: string;
  userId: string;
  lessonPlan: LessonPlan;
  relevantLessons: any[];
  createdAt: number;
  messages: Message[];
  topic: string;
  options: Options;
  subject: string;
  keyStage: string;
}

export interface LessonPlan {
  title: string;
  subject: string;
  keyStage: string;
  learningOutcome: string;
  learningCycles: string[];
  priorKnowledge: string[];
  keyLearningPoints: string[];
  misconceptions: Misconception[];
  keywords: Keyword[];
  starterQuiz: StarterQuiz[];
  cycle1: Cycle;
  cycle2: Cycle;
  cycle3: Cycle;
  exitQuiz: ExitQuiz[];
}

export interface Cycle {
  title: string;
  durationInMinutes: number;
  explanation: Explanation;
  checkForUnderstanding: CheckForUnderstanding[];
  practice: string;
  feedback: string;
}

export interface Explanation {
  spokenExplanation: string[];
  accompanyingSlideDetails: string;
  imagePrompt: string;
  slideText: string;
}

export interface CheckForUnderstanding {
  question: string;
  answers: string[];
  distractors: string[];
}

export interface ExitQuiz {
  question: string;
  answers: string[];
  distractors: string[];
}

export interface Misconception {
  misconception: string;
  description: string;
}

export interface Keyword {
  keyword: string;
  definition: string;
}

export interface StarterQuiz {
  question: string;
  answers: string[];
  distractors: string[];
}

export interface Message {
  id: string;
  content: string;
  role: string;
  createdAt?: string;
}

export interface Options {
  mode: string;
  model: string;
  useRag: boolean;
  temperature: number;
  useAnalytics: boolean;
  useModeration: boolean;
  usePersistence: boolean;
  useErrorReporting: boolean;
  useThreatDetection: boolean;
  numberOfLessonPlansInRag: number;
}

const ImagesPage = ({ pageData }: { pageData: PageData }) => {
  const [currentBatchData, setCurrentBatchData] =
    useState<ImagesFromCloudinary | null>(null);
  const [selectedImagePrompt, setSelectedImagePrompt] = useState("");
  const { data, error, isLoading, mutateAsync } =
    trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation();

  const slideTexts = {
    cycle1: pageData.lessonPlan.cycle1.explanation.imagePrompt,
    cycle2: pageData.lessonPlan.cycle2.explanation.imagePrompt,
    cycle3: pageData.lessonPlan.cycle3.explanation.imagePrompt,
  };

  const getTheData = useCallback(
    async (prompt: string) => {
      try {
        const response = await mutateAsync({
          searchExpression: prompt,
        });
        setCurrentBatchData(response as ImagesFromCloudinary);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [mutateAsync],
  );

  return (
    <div className="mx-auto mt-20 max-w-[1200px]">
      <Link href="/image-spike" className="opacity-75">{`<-back`}</Link>
      <h1 className="my-20 text-center text-2xl font-bold">{pageData.title}</h1>

      <div className="my-20 flex gap-10">
        {Object.entries(slideTexts).map(
          ([cycle, prompt]) =>
            prompt && (
              <button
                key={cycle}
                className={`w-1/3 rounded-lg border-2 border-black p-11 ${selectedImagePrompt === prompt ? "bg-black text-white" : ""}`}
                onClick={() => {
                  setSelectedImagePrompt(prompt);
                  getTheData(prompt);
                }}
              >
                <h2 className="text-sm opacity-70">{`${cycle.replace("cycle", "Cycle ")} image prompt`}</h2>
                <p>{prompt}</p>
              </button>
            ),
        )}
      </div>

      <p className="mt-16 border-t border-black border-opacity-25 pt-16 text-center">
        {selectedImagePrompt || "Select an image prompt to view it here"}
      </p>
      {isLoading && <LoadingWheel />}
      <div className="my-20 grid grid-cols-3 gap-15">
        {currentBatchData?.resources.map((image) => {
          const parsedImage = z
            .object({ url: z.string() })
            .passthrough()
            .parse(image);
          return (
            <div className="w-full" key={parsedImage.url}>
              <img src={parsedImage.url} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagesPage;
