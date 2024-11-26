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

interface ImageResponse {
  id: string;
  url: string;
  title?: string;
  alt?: string;
  license: string;
  photographer?: string;
}

const ImagesPage = ({ pageData }: { pageData: PageData }) => {
  const [currentBatchData, setCurrentBatchData] =
    useState<ImagesFromCloudinary | null>(null);

  const [imageSearchBatch, setImageSearchBatch] = useState<
    ImageResponse[] | null
  >(null);

  const [selectedImageSource, setSelectedImageSource] = useState("");

  const [selectedImagePrompt, setSelectedImagePrompt] = useState("");

  const slideTexts = {
    cycle1: pageData.lessonPlan.cycle1.explanation.imagePrompt,
    cycle2: pageData.lessonPlan.cycle2.explanation.imagePrompt,
    cycle3: pageData.lessonPlan.cycle3.explanation.imagePrompt,
  };

  const { isLoading, mutateAsync: cloudinaryMutateAsync } =
    trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation();

  const getTheDataFromCloudinary = useCallback(
    async (prompt: string) => {
      try {
        const response = await cloudinaryMutateAsync({
          searchExpression: prompt,
        });
        setCurrentBatchData(response as ImagesFromCloudinary);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [cloudinaryMutateAsync],
  );

  const { isLoading: isFlickrLoading, mutateAsync: flickrMutateAsync } =
    trpc.imageSearch.getImagesFromFlickr.useMutation();

  const getTheDataFromFlickr = useCallback(
    async (prompt: string) => {
      try {
        const response = await flickrMutateAsync({
          searchExpression: prompt,
        });

        setImageSearchBatch(response as ImageResponse[]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [flickrMutateAsync],
  );

  const { isLoading: isUnsplashLoading, mutateAsync: unsplashMutateAsync } =
    trpc.imageSearch.getImagesFromUnsplash.useMutation();

  const getTheDataFromUnsplash = useCallback(
    async (prompt: string) => {
      try {
        const response = await unsplashMutateAsync({
          searchExpression: prompt,
        });

        setImageSearchBatch(response as ImageResponse[]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [unsplashMutateAsync],
  );

  // const { isLoading: isLoadingWikiMedia, mutateAsync: wikiMediaMutateAsync } =
  //   trpc.imageSearch.getImagesFromWikimedia.useMutation();

  // const getTheDataFromWikimedia = useCallback(
  //   async (prompt: string) => {
  //     try {
  //       const response = await wikiMediaMutateAsync({
  //         searchExpression: prompt,
  //       });

  //       setImageSearchBatch(response as ImageResponse[]);
  //     } catch (err) {
  //       console.error("Error fetching data:", err);
  //     }
  //   },
  //   [wikiMediaMutateAsync],
  // );

  const { isLoading: isLoadingGoolge, mutateAsync: googleMutateAsync } =
    trpc.imageSearch.getImagesFromGoogle.useMutation();

  const getTheDataFromGoogle = useCallback(
    async (prompt: string) => {
      try {
        const response = await googleMutateAsync({
          searchExpression: prompt,
        });

        setImageSearchBatch(response as ImageResponse[]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    },
    [googleMutateAsync],
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
                  setCurrentBatchData(null);
                  setImageSearchBatch(null);
                }}
              >
                <h2 className="text-sm opacity-70">{`${cycle.replace("cycle", "Cycle ")} image prompt`}</h2>
                <p>{prompt}</p>
              </button>
            ),
        )}
      </div>

      <p className="mt-16 border-b border-t border-black border-opacity-25 py-16 text-center">
        {selectedImagePrompt
          ? "Prompt: " + selectedImagePrompt
          : "Select an image prompt to view it here"}
      </p>
      {isLoading && <LoadingWheel />}

      <div className="mt-22 flex w-full justify-center gap-10">
        <div>
          {isFlickrLoading && <LoadingWheel />}
          <button
            className={`${selectedImageSource === "Flickr" ? "bg-black text-white" : ""}`}
            onClick={() => {
              getTheDataFromFlickr(selectedImagePrompt);
              setSelectedImageSource("Flickr");
            }}
          >
            Flickr
          </button>
        </div>
        <div>
          {isUnsplashLoading && <LoadingWheel />}
          <button
            className={`${selectedImageSource === "Unsplash" ? "bg-black text-white" : ""}`}
            onClick={() => {
              getTheDataFromUnsplash(selectedImagePrompt);
              setSelectedImageSource("Unsplash");
            }}
          >
            Unsplash
          </button>
        </div>
        <div>
          <button
            className={`${selectedImageSource === "Cloudinary" ? "bg-black text-white" : ""}`}
            onClick={() => {
              getTheDataFromCloudinary(selectedImagePrompt);
              setSelectedImageSource("Cloudinary");
            }}
          >
            Cloudinary
          </button>
        </div>
        <div>
          <button
            className={`${selectedImageSource === "Google" ? "bg-black text-white" : ""}`}
            onClick={() => {
              getTheDataFromGoogle(selectedImagePrompt);
              setSelectedImageSource("Google");
            }}
          >
            Google
          </button>
        </div>
      </div>

      {selectedImageSource !== "Cloudinary" ? (
        <div className="my-20 grid grid-cols-3 gap-15">
          {imageSearchBatch ? (
            imageSearchBatch?.map((image) => (
              <div key={image.id}>
                <img src={image.url} />
              </div>
            ))
          ) : (
            <p className="text-center">Choose a source</p>
          )}
        </div>
      ) : (
        <div className="my-20 grid grid-cols-3 gap-15">
          {currentBatchData ? (
            currentBatchData?.resources.map((image) => {
              const parsedImage = z
                .object({ url: z.string() })
                .passthrough()
                .parse(image);
              return (
                <div className="w-full" key={parsedImage.url}>
                  <img src={parsedImage.url} />
                </div>
              );
            })
          ) : (
            <p className="text-center">Choose a source</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
