"use client";

import { useCallback, useState } from "react";

import { type ValidationResult } from "@oakai/api/src/imageGen/validateImageWithOpenAI";
import type { Resource } from "ai-apps/image-alt-generation/types";
import Image from "next/image";
import Link from "next/link";

import LoadingWheel from "@/components/LoadingWheel";
import { trpc } from "@/utils/trpc";

type ValidatedImage = {
  imageData: ImageResponse;
  validationResult: ValidationResult;
};

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
  appropriatenessScore?: number;
  appropriatenessReasoning?: string;
  imageSource?: string;
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
  const [theBestImage, setTheBestImage] = useState<{
    data: ValidatedImage | null | undefined;
    status: string;
  } | null>(null);
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

  // Move all mutation declarations to component level
  const cloudinaryMutation =
    trpc.cloudinaryRouter.getCloudinaryImagesBySearchExpression.useMutation();
  const flickrMutation = trpc.imageSearch.getImagesFromFlickr.useMutation();
  const unsplashMutation = trpc.imageSearch.getImagesFromUnsplash.useMutation();
  const stableDiffusionCoreMutation = trpc.imageGen.stableDifCore.useMutation();
  const daleMutation = trpc.imageGen.openAi.useMutation();
  const validateImage = trpc.imageGen.validateImage.useMutation();
  const validateImagesInParallel =
    trpc.imageGen.validateImagesInParallel.useMutation();
  // Other mutations for the comparison feature
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
    // Google: trpc.imageSearch.getImagesFromGoogle.useMutation(),
    // "Simple Google": trpc.imageSearch.simpleGoogleSearch.useMutation(),
  };

  const findTheBestImage = useCallback(async () => {
    let validImages: ValidatedImage[] = [];

    function updateStatus(status: string) {
      console.log("[Status Update]:", status);
      setTheBestImage((prev) => ({
        data: prev?.data,
        status,
      }));
    }

    updateStatus("Searching Cloudinary...");
    try {
      // Try Cloudinary first
      console.log(
        "[Cloudinary] Starting search with prompt:",
        selectedImagePrompt,
      );
      const cloudinaryImages = await cloudinaryMutation.mutateAsync({
        searchExpression: selectedImagePrompt,
      });
      console.log("[Cloudinary] Raw response:", cloudinaryImages);

      const cloudinaryData = (
        cloudinaryImages as ImagesFromCloudinary
      ).resources.map((image) => ({
        id: image.public_id,
        url: image.url,
        license: "Cloudinary",
      }));
      console.log("[Cloudinary] Processed data:", cloudinaryData);

      console.log("[Validation] Starting Cloudinary validation");

      const validateCloudinaryResponse =
        await validateImagesInParallel.mutateAsync({
          images: cloudinaryData,
          searchExpression: selectedImagePrompt,
        });

      console.log(
        "[Validation] Cloudinary validation results:",
        validateCloudinaryResponse,
      );

      validImages = [
        ...validateCloudinaryResponse.filter(
          (image) => image.validationResult.isValid,
        ),
      ];
      console.log("[Cloudinary] Valid images:", validImages);

      // If we don't have enough valid images, try Flickr
      if (validImages.length < 1) {
        updateStatus("Nothing appropriate on cloudinary, searching Flickr...");
        console.log("[Flickr] Starting search");
        const flickrImages = await flickrMutation.mutateAsync({
          searchExpression: selectedImagePrompt,
        });
        console.log("[Flickr] Raw response:", flickrImages);

        console.log("[Validation] Starting Flickr validation");

        const validateFlickrResponse =
          await validateImagesInParallel.mutateAsync({
            images: flickrImages,
            searchExpression: selectedImagePrompt,
          });

        console.log(
          "[Validation] Flickr validation results:",
          validateFlickrResponse,
        );

        validImages = [
          ...validImages,
          ...validateFlickrResponse.filter(
            (image) => image.validationResult.isValid,
          ),
        ];
        console.log("[Flickr] Updated valid images:", validImages);
      }

      // If still not enough, try Unsplash
      if (validImages.length < 1) {
        updateStatus("Nothing appropriate on Flickr, searching Unsplash...");
        console.log("[Unsplash] Starting search");
        const unsplashImages = await unsplashMutation.mutateAsync({
          searchExpression: selectedImagePrompt,
        });
        console.log("[Unsplash] Raw response:", unsplashImages);

        console.log("[Validation] Starting Unsplash validation");
        const validateUnsplashResponse =
          await validateImagesInParallel.mutateAsync({
            images: unsplashImages,
            searchExpression: selectedImagePrompt,
          });
        console.log(
          "[Validation] Unsplash validation results:",
          validateUnsplashResponse,
        );

        validImages = [
          ...validImages,
          ...validateUnsplashResponse.filter(
            (image) => image.validationResult.isValid,
          ),
        ];
        console.log("[Unsplash] Updated valid images:", validImages);
      }

      // If still not enough, try Stable Diffusion Core
      if (validImages.length < 1) {
        updateStatus(
          "Nothing appropriate on Unsplash, generating an image using Stable Diffusion Core...",
        );
        console.log("[StableDiffusion] Starting generation");
        const stableDiffusionCoreImages =
          await stableDiffusionCoreMutation.mutateAsync({
            searchExpression: selectedImagePrompt,
          });
        console.log(
          "[StableDiffusion] Raw response:",
          stableDiffusionCoreImages,
        );

        const stableDiffusionCoreData = [
          {
            id: "1",
            url: stableDiffusionCoreImages,
            license: "Stable Diffusion Core",
          },
        ];
        console.log(
          "[StableDiffusion] Processed data:",
          stableDiffusionCoreData,
        );

        console.log("[Validation] Starting Stable Diffusion validation");
        const validateStableDiffusionResponse =
          await validateImagesInParallel.mutateAsync({
            images: stableDiffusionCoreData,
            searchExpression: selectedImagePrompt,
          });
        console.log(
          "[Validation] Stable Diffusion validation results:",
          validateStableDiffusionResponse,
        );

        validImages = [
          ...validImages,
          ...validateStableDiffusionResponse.filter(
            (image) => image.validationResult.isValid,
          ),
        ];
        console.log("[StableDiffusion] Updated valid images:", validImages);
      }

      // If still not enough, try DALL-E as last resort
      if (validImages.length < 1) {
        updateStatus(
          "Stable Diffusion Core did not generate a usable image, generating an image using DAL-E...",
        );
        console.log("[DALL-E] Starting generation");
        const daleImages = await daleMutation.mutateAsync({
          searchExpression: selectedImagePrompt,
        });
        console.log("[DALL-E] Raw response:", daleImages);

        const daleData = [
          {
            id: "1",
            url: daleImages,
            license: "OpenAI",
          },
        ];
        console.log("[DALL-E] Processed data:", daleData);

        console.log("[Validation] Starting DALL-E validation");
        const validateDaleResponse = await validateImagesInParallel.mutateAsync(
          {
            images: daleData,
            searchExpression: selectedImagePrompt,
          },
        );
        console.log(
          "[Validation] DALL-E validation results:",
          validateDaleResponse,
        );

        validImages = [
          ...validImages,
          ...validateDaleResponse.filter(
            (image) => image.validationResult.isValid,
          ),
        ];
        console.log("[DALL-E] Updated valid images:", validImages);
      }

      // Sort all valid images by appropriateness score if we have more than one
      if (validImages.length > 1) {
        validImages.sort(
          (a, b) =>
            b.validationResult.metadata.appropriatenessScore -
            a.validationResult.metadata.appropriatenessScore,
        );
        console.log("[Final] Sorted valid images:", validImages);
      }

      // Return the best image or null if no valid images were found
      const finalAnswer = validImages.length > 0 ? validImages[0] : null;
      console.log("[Final] Selected best image:", finalAnswer);

      setTheBestImage({
        data: finalAnswer,
        status: finalAnswer
          ? "The best image has been found!"
          : "No appropriate images found.",
      });
      return finalAnswer;
    } catch (error) {
      console.error("[Error] Error in findTheBestImage:", error);
      setTheBestImage({
        data: null,
        status: "An error occurred while searching for images.",
      });
      return null;
    }
  }, [
    selectedImagePrompt,
    cloudinaryMutation,
    flickrMutation,
    unsplashMutation,
    stableDiffusionCoreMutation,
    daleMutation,
  ]);

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

        if (source === "Custom Pipeline With Reasoning") {
          updateColumn(columnId, {
            imageSearchBatch: response as ImageResponse[],
          });
        } else if (
          source === "Stable Diffusion Ultra" ||
          source === "Stable Diffusion 3.0 & 3.5" ||
          source === "Stable Diffusion Core" ||
          source === "Custom Pipeline"
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
                  setTheBestImage(null);
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
      <div className="mt-16 flex justify-center gap-8">
        {selectedImagePrompt && (
          <>
            {comparisonColumns.length < 3 && (
              <button
                onClick={addComparisonColumn}
                className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-gray-400 px-4 py-2 hover:bg-gray-100"
              >
                Add comparison column
              </button>
            )}
            <button
              onClick={() => findTheBestImage()}
              className="mt-4 flex w-fit items-center gap-2 rounded-lg border border-gray-400 px-4 py-2 hover:bg-gray-100"
            >
              Use custom logic to find the best image
            </button>
          </>
        )}
      </div>
      {theBestImage && (
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold">
            {theBestImage.status}
          </h2>
          {theBestImage.data && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <Image
                src={theBestImage.data.imageData.url}
                alt={theBestImage.data.imageData.alt || "Image"}
                className="w-full"
                width={400}
                height={400}
              />
              <p>License: {theBestImage.data.imageData.license}</p>
              <p>
                Relavance Score:{" "}
                {
                  theBestImage.data.validationResult.metadata
                    .appropriatenessScore
                }
              </p>
              <p>
                Reasoning:{" "}
                {
                  theBestImage.data.validationResult.metadata
                    .validationReasoning
                }
              </p>
              {theBestImage.data.imageData.photographer && (
                <p>By: {theBestImage.data.imageData.photographer}</p>
              )}
              {theBestImage.data.imageData.title && (
                <p>Title: {theBestImage.data.imageData.title}</p>
              )}
            </div>
          )}
        </div>
      )}
      {!theBestImage && selectedImagePrompt && (
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
                        <p>
                          Relavance Score: {image.appropriatenessScore ?? ""}
                        </p>
                        <p>Reasoning: {image.appropriatenessReasoning ?? ""}</p>
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
