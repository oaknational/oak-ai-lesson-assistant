"use client";

import { useCallback, useState } from "react";

import type { Resource } from "ai-apps/image-alt-generation/types";
import Link from "next/link";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

export interface PageData {
  id: string;
  path: string;
  title: string;
  lessonPlan: {
    cycle1: { explanation: { imagePrompt: string } };
    cycle2: { explanation: { imagePrompt: string } };
    cycle3: { explanation: { imagePrompt: string } };
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

const ImagesPage = ({ pageData }: { pageData: PageData }) => {
  const [selectedImageSource, setSelectedImageSource] = useState<string | null>(
    null,
  );
  const [selectedImagePrompt, setSelectedImagePrompt] = useState<string>("");
  const [imageSearchBatch, setImageSearchBatch] = useState<
    ImageResponse[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slideTexts = {
    cycle1: pageData.lessonPlan.cycle1.explanation.imagePrompt,
    cycle2: pageData.lessonPlan.cycle2.explanation.imagePrompt,
    cycle3: pageData.lessonPlan.cycle3.explanation.imagePrompt,
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, react-hooks/exhaustive-deps
  const trpcMutations = {
    Flickr: trpc.imageSearch.getImagesFromFlickr.useMutation(),
    Unsplash: trpc.imageSearch.getImagesFromUnsplash.useMutation(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Cloudinary:
      trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation(),
    Google: trpc.imageSearch.getImagesFromGoogle.useMutation(),
    "Simple Google": trpc.imageSearch.simpleGoogleSearch.useMutation(),
  };

  const fetchImages = useCallback(
    async (source: string, prompt: string) => {
      if (!trpcMutations[source]) {
        setError("Invalid image source selected.");
        return;
      }

      const mutation = trpcMutations[source];
      setIsLoading(true);
      setError(null);
      setImageSearchBatch(null); // Clear the image grid before loading new data.

      try {
        const response = await mutation.mutateAsync({
          searchExpression: prompt,
        });

        if (source === "Cloudinary") {
          const cloudinaryData = (
            response as ImagesFromCloudinary
          ).resources.map((image) => ({
            id: image.public_id,
            url: image.url,
            license: "Cloudinary",
          }));
          setImageSearchBatch(cloudinaryData);
        } else if (Array.isArray(response) && response.length === 0) {
          setError("No images found for the selected prompt.");
        } else {
          setImageSearchBatch(response as ImageResponse[]);
        }
      } catch (err: any) {
        setError(err?.message || "An error occurred while fetching images.");
      } finally {
        setIsLoading(false);
      }
    },
    [trpcMutations],
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
                className={`w-1/3 rounded-lg border-2 border-black p-11 ${
                  selectedImagePrompt === prompt ? "bg-black text-white" : ""
                }`}
                onClick={() => {
                  setSelectedImagePrompt(prompt);
                  setImageSearchBatch(null); // Clear grid on prompt selection.
                  setSelectedImageSource(null); // Reset the source dropdown.
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

      <p className="mt-16 border-b border-t border-black border-opacity-25 py-16 text-center">
        {selectedImagePrompt
          ? "Prompt: " + selectedImagePrompt
          : "Select an image prompt to view it here"}
      </p>

      {selectedImagePrompt && (
        <div className="my-10">
          <label htmlFor="imageSource" className="block text-center">
            Select an image source:
          </label>
          <select
            id="imageSource"
            className="mx-auto mt-4 block w-1/3 rounded border border-gray-400 p-2"
            value={selectedImageSource || ""}
            onChange={(e) => {
              const source = e.target.value;
              setSelectedImageSource(source);
              if (source) {
                fetchImages(source, selectedImagePrompt);
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
      )}

      {isLoading && <LoadingWheel />}
      {error && <p className="text-center text-red-600">{error}</p>}
      {imageSearchBatch && (
        <div className="my-20 grid grid-cols-3 gap-10">
          {imageSearchBatch.map((image) => (
            <div key={image.id} className="flex flex-col items-center gap-4">
              <img
                src={image.url}
                alt={image.alt || "Image"}
                className="w-full"
              />
              <p>License: {image.license}</p>
              {image.photographer && <p>By: {image.photographer}</p>}
              {image.title && <p>Title: {image.title}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesPage;
