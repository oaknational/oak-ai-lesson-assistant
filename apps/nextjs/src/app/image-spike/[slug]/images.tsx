"use client";

import { useCallback, useState } from "react";

import type { Resource } from "ai-apps/image-alt-generation/types";
import Image from "next/image";
import Link from "next/link";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

export interface PageData {
  id?: string;
  path?: string;
  title?: string;
  lessonPlan?: {
    cycle1?: { explanation?: { imagePrompt?: string } };
    cycle2?: { explanation?: { imagePrompt?: string } };
    cycle3?: { explanation?: { imagePrompt?: string } };
  };
}

interface ImageResponse {
  id: string;
  url: string;
  title?: string;
  alt?: string;
  license: string;
  photographer?: string;
}

type ImagesFromCloudinary = {
  total_count: number;
  time: number;
  next_cursor: string;
  resources: Resource[];
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
};

interface ComparisonColumn {
  id: string;
  selectedImageSource: string | null;
  imageSearchBatch: ImageResponse[] | null;
  isLoading: boolean;
  error: string | null;
}

const ImagesPage = ({ pageData }: { pageData: PageData }) => {
  const [selectedImagePrompt, setSelectedImagePrompt] = useState<string>("");
  const [comparisonColumns, setComparisonColumns] = useState<
    ComparisonColumn[]
  >([
    {
      id: "column-1",
      selectedImageSource: null,
      imageSearchBatch: null,
      isLoading: false,
      error: null,
    },
  ]);

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

  const trpcMutations = {
    "Stable Diffusion Ultra": trpc.imageGen.stableDifUltra.useMutation(),
    "Stable Diffusion 3.0 & 3.5": trpc.imageGen.stableDif3.useMutation(),
    "Stable Diffusion Core": trpc.imageGen.stableDifCore.useMutation(),
    "DAL-E": trpc.imageGen.openAi.useMutation(),
    Flickr: trpc.imageSearch.getImagesFromFlickr.useMutation(),
    Unsplash: trpc.imageSearch.getImagesFromUnsplash.useMutation(),
    Cloudinary:
      trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation(),
    Google: trpc.imageSearch.getImagesFromGoogle.useMutation(),
    "Simple Google": trpc.imageSearch.simpleGoogleSearch.useMutation(),
  };

  const fetchImages = useCallback(
    async (columnId: string, source: string, prompt: string) => {
      if (!trpcMutations[source]) {
        updateColumn(columnId, { error: "Invalid image source selected." });
        return;
      }

      const mutation = trpcMutations[source];
      updateColumn(columnId, {
        isLoading: true,
        error: null,
        imageSearchBatch: null,
      });

      try {
        const response = await mutation.mutateAsync({
          searchExpression: prompt,
        });

        if (
          source === "Stable Diffusion Ultra" ||
          source === "Stable Diffusion 3.0 & 3.5" ||
          source === "Stable Diffusion Core"
        ) {
          updateColumn(columnId, {
            imageSearchBatch: [
              {
                id: "1",
                url: response as string,
                license: "Stable Diffusion",
              },
            ],
          });
        } else if (source === "DAL-E") {
          updateColumn(columnId, {
            imageSearchBatch: [
              {
                id: "1",
                url: response as string,
                license: "OpenAI",
              },
            ],
          });
        } else if (source === "Cloudinary") {
          const cloudinaryData = (
            response as ImagesFromCloudinary
          ).resources.map((image) => ({
            id: image.public_id,
            url: image.url,
            license: "Cloudinary",
          }));
          updateColumn(columnId, { imageSearchBatch: cloudinaryData });
        } else if (Array.isArray(response) && response.length === 0) {
          updateColumn(columnId, {
            error: "No images found for the selected prompt.",
          });
        } else {
          updateColumn(columnId, {
            imageSearchBatch: response as ImageResponse[],
          });
        }
      } catch (err: any) {
        updateColumn(columnId, {
          error: err?.message || "An error occurred while fetching images.",
        });
      } finally {
        updateColumn(columnId, { isLoading: false });
      }
    },
    [trpcMutations],
  );

  const updateColumn = (
    columnId: string,
    updates: Partial<ComparisonColumn>,
  ) => {
    setComparisonColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
    );
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

  const removeComparisonColumn = (columnId: string) => {
    setComparisonColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

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
                className={`w-1/3 rounded-lg border-2 border-black p-11 ${
                  selectedImagePrompt === prompt ? "bg-black text-white" : ""
                }`}
                onClick={() => {
                  setSelectedImagePrompt(prompt);
                  setComparisonColumns((prev) =>
                    prev.map((col) => ({
                      ...col,
                      imageSearchBatch: null,
                      selectedImageSource: null,
                    })),
                  );
                }}
              >
                <h2 className="text-sm opacity-70">{`${cycle.replace(
                  "cycle",
                  "Cycle ",
                )} image prompt`}</h2>
                <p>{prompt}</p>
              </button>
            ),
        )}
      </div>
      <div className="mt-16 flex flex-col gap-6 border-b border-t border-black border-opacity-25 py-16 text-center">
        <p className="">
          {selectedImagePrompt
            ? "Prompt: " + selectedImagePrompt
            : "Select an image prompt to view it here"}
        </p>
      </div>
      <div className="mt-16">
        {selectedImagePrompt && comparisonColumns.length < 3 && (
          <button
            onClick={addComparisonColumn}
            className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-gray-400 px-4 py-2 hover:bg-gray-100"
          >
            Add comparison
          </button>
        )}
      </div>

      {selectedImagePrompt && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {comparisonColumns.map((column, index) => (
            <div key={column.id} className="relative">
              {index > 0 && (
                <button
                  onClick={() => removeComparisonColumn(column.id)}
                  className="absolute -right-2 -top-2 rounded-full  p-1 hover:bg-gray-300"
                >
                  <p>X</p>
                </button>
              )}
              <div className="my-10">
                <label
                  htmlFor={`imageSource-${column.id}`}
                  className="block text-center"
                >
                  Select an image source:
                </label>
                <select
                  id={`imageSource-${column.id}`}
                  className="mx-auto mt-4 block w-full rounded border border-gray-400 p-2"
                  value={column.selectedImageSource || ""}
                  onChange={(e) => {
                    const source = e.target.value;
                    updateColumn(column.id, { selectedImageSource: source });
                    if (source) {
                      fetchImages(column.id, source, selectedImagePrompt);
                    }
                  }}
                >
                  <option value="" disabled>
                    Choose a source
                  </option>
                  {Object.keys(trpcMutations).map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              {column.isLoading && <LoadingWheel />}
              {column.error && (
                <p className="text-center text-red-600">{column.error}</p>
              )}
              {column.imageSearchBatch && (
                <div className="my-20 grid grid-cols-1 gap-10">
                  {column.imageSearchBatch?.map((image, i) => {
                    console.log("image", image.url);
                    return (
                      <div
                        key={image.id}
                        className="flex flex-col items-center gap-4"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || "Image"}
                          className="w-full"
                          width={400}
                          height={400}
                        />
                        <p>License: {image.license}</p>
                        {image.photographer && <p>By: {image.photographer}</p>}
                        {image.title && <p>Title: {image.title}</p>}
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
  );
};

export default ImagesPage;
