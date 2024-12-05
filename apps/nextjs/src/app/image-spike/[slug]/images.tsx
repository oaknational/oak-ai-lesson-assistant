"use client";

import React, { useCallback, useState } from "react";

import { OakIcon } from "@oaknational/oak-components";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import { useBestImage } from "hooks/useBestImage";
import { useImageSearch } from "hooks/useImageSearch";
import Image from "next/image";
import Link from "next/link";
import type { ImageResponse } from "types/imageTypes";

import LoadingWheel from "@/components/LoadingWheel";
import { RegenerationForm } from "@/components/RegenerationForm";

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

function promptConstructor(
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

  return `You are generating an image for a lesson taught in a uk school following the uk national curriculum. The lesson is at the ${keyStage} level and the subject is  ${subject}. 
  
  The lesson title is ${lessonTitle}. The lesson is broken down in to three learning sections, the title of this section is ${title}. 
  
  The image you are generating is for a slide in this section that will be shown in class, the slide will have the following text on it: ${explanation?.slideText} and the teacher will say the following: ${explanation?.spokenExplanation?.join(" ")}. Here are some additional details about the slide: ${explanation?.accompanyingSlideDetails ?? ""}.

  The students will then practice what they have learned by ${practice} and the teacher will provide feedback by ${feedback}.

  The prompt for the image is ${searchExpression}.`;
}

const ImagesPage = ({ pageData }) => {
  const [selectedImagePrompt, setSelectedImagePrompt] = useState("");
  const [comparisonColumns, setComparisonColumns] = useState<
    {
      id: string;
      selectedImageSource: string | null;
      imageSearchBatch: ImageResponse[] | null;
      isLoading: boolean;
      error: string | null;
    }[]
  >([
    {
      id: "column-1",
      selectedImageSource: null,
      imageSearchBatch: null,
      isLoading: false,
      error: null,
    },
  ]);

  // In your ImagesPage component, add this state
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { bestImage, findBestImage } = useBestImage({ pageData });
  const { fetchImages, availableSources, regenerateImageWithAnalysis } =
    useImageSearch({ pageData });

  // Add this function to handle regeneration
  const handleRegeneration = async (columnId: string, feedback: string) => {
    const column = comparisonColumns.find((col) => col.id === columnId);
    if (!column?.imageSearchBatch?.[0]) return;

    const image = column.imageSearchBatch[0];

    updateColumn(columnId, { isLoading: true });

    if (!image.imageSource) {
      throw new Error("Image source is required to regenerate image.");
    }

    try {
      setIsRegenerating(true);
      const regeneratedImage = await regenerateImageWithAnalysis(
        image.url,
        selectedImagePrompt,
        feedback,
        image.imageSource.toLowerCase().includes("Stability AI")
          ? "stability"
          : "openai",
      );

      setIsRegenerating(false);
      updateColumn(columnId, {
        imageSearchBatch: [regeneratedImage],
      });
    } catch (error) {
      setIsRegenerating(false);
      console.error("Error regenerating image:", error);
      updateColumn(columnId, {
        error: "Failed to regenerate image",
      });
    } finally {
      updateColumn(columnId, { isLoading: false });
    }
  };

  if (
    !pageData?.lessonPlan?.cycle1?.explanation?.imagePrompt ||
    !pageData?.lessonPlan?.cycle2?.explanation?.imagePrompt ||
    !pageData?.lessonPlan?.cycle3?.explanation?.imagePrompt
  ) {
    return "Please choose a lesson with all three learning cycles";
  }

  const slideTexts = {
    cycle1: pageData?.lessonPlan?.cycle1?.explanation?.imagePrompt,
    cycle2: pageData?.lessonPlan?.cycle2?.explanation?.imagePrompt,
    cycle3: pageData?.lessonPlan?.cycle3?.explanation?.imagePrompt,
  };

  const updateColumn = useCallback((columnId, updates) => {
    setComparisonColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
    );
  }, []);

  const handleImageFetch = async (columnId, source, prompt) => {
    updateColumn(columnId, {
      isLoading: true,
      error: null,
      imageSearchBatch: null,
    });

    try {
      const images = await fetchImages(source, prompt);
      updateColumn(columnId, { imageSearchBatch: images });
    } catch (err) {
      updateColumn(columnId, {
        error: "An error occurred while fetching images.",
      });
    } finally {
      updateColumn(columnId, { isLoading: false });
    }
  };

  const addComparisonColumn = () => {
    if (comparisonColumns.length < 3) {
      setComparisonColumns((prev) => [
        ...prev,
        {
          id: `column-${prev.length + 1}`,
          selectedImageSource: null,
          imageSearchBatch: null,
          isLoading: false,
          error: null,
        },
      ]);
    }
  };

  const removeComparisonColumn = (columnId) => {
    setComparisonColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/image-spike"
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <OakIcon iconName="arrow-left" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-semibold">
            {pageData.title} • {pageData.keyStage} • {pageData.subject}
          </h1>
        </div>

        {/* Learning Cycles Tabs */}
        <Tabs.Root
          defaultValue="cycle1"
          className="mb-8"
          onValueChange={(value) => {
            setSelectedImagePrompt(slideTexts[value]);
            setComparisonColumns((prev) =>
              prev.map((col) => ({
                ...col,
                imageSearchBatch: null,
                selectedImageSource: null,
              })),
            );
          }}
        >
          <Tabs.List className="flex space-x-2 border-b border-gray-200">
            {Object.entries(slideTexts).map(([cycle]) => (
              <Tabs.Trigger
                key={cycle}
                value={cycle}
                className="data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 px-6 py-3 text-sm font-medium text-gray-600 data-[state=active]:border-b-2"
              >
                {cycle.replace("cycle", "Learning Cycle ")}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {Object.entries(slideTexts).map(([cycle, prompt]) => (
            <Tabs.Content key={cycle} value={cycle}>
              <div className="mt-4 rounded-lg border bg-white p-6">
                <h3 className="mb-2 font-medium">Image Prompt from aila</h3>
                <p className="mb-2 text-gray-600">{prompt}</p>
                <b />
                <br />

                <p className="mb-2 font-medium">
                  Search expression used on search endpoints:
                </p>
                <p className="text-gray-600">{prompt}</p>
                <b />
                <br />

                <p className="mb-2 font-medium">Prompt used for generation:</p>

                <p className="text-gray-600">
                  {promptConstructor(
                    prompt,
                    pageData.title,
                    pageData.subject,
                    pageData.keyStage,
                    pageData.lessonPlan,
                  )}
                </p>
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>

        {/* Action Buttons */}
        {selectedImagePrompt && (
          <div className="mb-8 flex gap-4">
            {comparisonColumns.length < 3 && (
              <button
                onClick={addComparisonColumn}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <div
                  className="rotate-45
                "
                >
                  <OakIcon iconName="cross" />
                </div>
                Add Comparison Column
              </button>
            )}
            <button
              onClick={() => findBestImage(selectedImagePrompt)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors"
            >
              <OakIcon iconName="search" />
              Find "Best" Image
            </button>
          </div>
        )}

        {/* Best Image Result */}
        {bestImage && (
          <div className="mb-8 rounded-lg border bg-white p-6">
            <h2 className="mb-6 text-xl font-semibold">{bestImage.status}</h2>
            {bestImage.data && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-96 w-full overflow-hidden rounded-lg">
                  <Image
                    src={bestImage.data.imageData.url}
                    alt={bestImage.data.imageData.alt || "Image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">License:</span>{" "}
                    {bestImage.data.imageData.license}
                  </p>
                  <p>
                    <span className="font-medium">Relevance Score:</span>{" "}
                    {
                      bestImage.data.validationResult.metadata
                        .appropriatenessScore
                    }
                  </p>
                  <p>
                    <span className="font-medium">Prompt used:</span>{" "}
                    {bestImage.data.imagePrompt}
                  </p>
                  <p>
                    <span className="font-medium">Reasoning:</span>{" "}
                    {
                      bestImage.data.validationResult.metadata
                        .validationReasoning
                    }
                  </p>
                  {bestImage.data.imageData.photographer && (
                    <p>
                      <span className="font-medium">By:</span>{" "}
                      {bestImage.data.imageData.photographer}
                    </p>
                  )}
                  {bestImage.data.imageData.title && (
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {bestImage.data.imageData.title}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison Columns */}
        {!bestImage && selectedImagePrompt && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {comparisonColumns.map((column, index) => (
              <div
                key={column.id}
                className="relative rounded-lg border bg-white p-6"
              >
                {index > 0 && (
                  <button
                    onClick={() => removeComparisonColumn(column.id)}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <OakIcon iconName="cross" />
                  </button>
                )}
                <h3 className="mb-4 text-lg font-medium">Source {index + 1}</h3>

                <Select.Root
                  value={column.selectedImageSource || ""}
                  onValueChange={(value) => {
                    updateColumn(column.id, { selectedImageSource: value });
                    handleImageFetch(column.id, value, selectedImagePrompt);
                  }}
                >
                  <Select.Trigger className="flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50">
                    <Select.Value placeholder="Choose a source" />
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg border bg-white shadow-lg">
                      <Select.Viewport className="p-1">
                        {Object.keys(availableSources).map((source) => (
                          <Select.Item
                            key={source}
                            value={source}
                            className="relative flex select-none items-center rounded-md px-8 py-2 text-sm text-gray-700 data-[highlighted]:bg-gray-100 data-[highlighted]:outline-none"
                          >
                            <Select.ItemText>{source}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                {column.isLoading && (
                  <div className="flex justify-center py-8">
                    <LoadingWheel />
                  </div>
                )}

                {column.error && (
                  <p className="mt-4 text-center text-sm text-red-600">
                    {column.error}
                  </p>
                )}

                {column.imageSearchBatch && (
                  <div className="mt-6 space-y-6">
                    {column.imageSearchBatch?.map((image) => {
                      console.log("iumage", image);
                      return (
                        <div
                          key={image.id}
                          className="rounded-lg border bg-gray-50 p-4"
                        >
                          <div className="relative mb-4 h-48 w-full rounded-lg object-contain">
                            {isRegenerating ? (
                              <LoadingWheel />
                            ) : (
                              <Image
                                src={image.url}
                                alt={image.alt || "Image"}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          {(image.imageSource === "DAL-E" ||
                            image.imageSource?.includes(
                              "Stable Diffusion",
                            )) && (
                            <RegenerationForm
                              onSubmit={(feedback) =>
                                handleRegeneration(column.id, feedback)
                              }
                              imageSource={image.imageSource}
                            />
                          )}
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">License:</span>{" "}
                              {image.license}
                            </p>
                            <p>
                              <span className="font-medium">Score:</span>{" "}
                              {image.appropriatenessScore}
                            </p>
                            <p>
                              <span className="font-medium">Prompt used:</span>{" "}
                              {image.imagePrompt}
                            </p>
                            <p>
                              <span className="font-medium">Reasoning:</span>{" "}
                              {image.appropriatenessReasoning}
                            </p>
                            {image.photographer && (
                              <p>
                                <span className="font-medium">By:</span>{" "}
                                {image.photographer}
                              </p>
                            )}
                            {image.title && (
                              <p>
                                <span className="font-medium">Title:</span>{" "}
                                {image.title}
                              </p>
                            )}
                            <div className="mt-4 border-t pt-4 text-xs">
                              <p>Fetch: {image.timing.fetch.toFixed(2)}ms</p>
                              <p>
                                Validation: {image.timing.validation.toFixed(2)}
                                ms
                              </p>
                              <p>Total: {image.timing.total.toFixed(2)}ms</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesPage;
