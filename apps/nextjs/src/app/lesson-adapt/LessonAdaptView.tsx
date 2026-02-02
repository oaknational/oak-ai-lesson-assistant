"use client";

import { useState } from "react";

import {
  AdaptChatSidebar,
  AdaptLessonContent,
} from "@/components/AppComponents/LessonAdapt";
import { trpc } from "@/utils/trpc";

const LessonAdaptPage = () => {
  const [lessonId, setLessonId] = useState("");
  const [fetchedLessonId, setFetchedLessonId] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.lessonAdapt.getLessonContent.useQuery(
    { lessonSlug: fetchedLessonId ?? "" },
    {
      enabled: !!fetchedLessonId,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch thumbnails in the background once we have the presentationId
  const {
    data: thumbnailsData,
    isLoading: thumbnailsLoading,
    error: thumbnailsError,
  } = trpc.lessonAdapt.getSlideThumbnails.useQuery(
    { presentationId: data?.duplicatedPresentationId ?? "" },
    {
      enabled: !!data?.duplicatedPresentationId,
      refetchOnWindowFocus: false,
    },
  );

  const handleFetch = () => {
    if (lessonId.trim()) {
      console.log("Fetching lesson with ID:", lessonId);
      setFetchedLessonId(lessonId);
    }
  };

  const klpLcMapping = data?.slideContent.slides.map((slide) => {
    return {
      slideNumber: slide.slideNumber,
      keyLearningPoints: slide.keyLearningPoints ?? [],
      learningCycles: slide.learningCycles ?? [],
    };
  });

  return (
    <div className="flex h-screen flex-col">
      {/* Top input section - always visible */}
      <div className="border-b border-gray-300 bg-white p-6">
        <h1 className="mb-4 text-2xl font-bold">Lesson Adapt</h1>

        <div className="mb-2">
          <label className="mb-2 block text-sm font-medium">
            Lesson ID (Lesson Slug): the-modern-world-of-work
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              placeholder="Enter lesson slug (e.g. 'identifying-equivalent-fractions')"
              className="flex-1 rounded border p-2"
            />
            <button
              onClick={handleFetch}
              disabled={!lessonId.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-grey-400 rounded px-4 py-2"
            >
              {isLoading ? "Loading..." : "Fetch Lesson"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-800">Error:</p>
            <p className="text-red-600">{error.message}</p>
          </div>
        )}

        {data && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-semibold text-green-800">
              ✓ Lesson fetched successfully! Slide deck duplicated and ready for
              adaptation
            </p>
          </div>
        )}
      </div>

      {/* Main content area with chat and lesson content */}
      {data && (
        <div className="flex flex-1 overflow-hidden">
          <AdaptChatSidebar sessionId={data.sessionId} />
          <AdaptLessonContent
            presentationId={data.duplicatedPresentationId}
            presentationUrl={data.duplicatedPresentationUrl}
            lessonData={data.lessonData}
            thumbnails={thumbnailsData?.thumbnails}
            thumbnailsLoading={thumbnailsLoading}
            thumbnailsError={thumbnailsError}
          />
        </div>
      )}

      {/* Debug info - collapsible */}
      {data && (
        <details className="border-t border-gray-300 bg-gray-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Debug Info (Click to expand)
          </summary>
          <div className="mt-2 space-y-2">
            <details className="rounded border bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold">
                Extracted Slide Content - LLM Format
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">
                {JSON.stringify(data.slideContent, null, 2)}
              </pre>
            </details>
            <details className="rounded border bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold">
                Key learning points and learning cycles mapping
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">
                {JSON.stringify(klpLcMapping, null, 2)}
              </pre>
            </details>

            <details className="rounded border bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold">
                Raw Lesson Data
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">
                {JSON.stringify(data.rawLessonData, null, 2)}
              </pre>
            </details>
          </div>
        </details>
      )}
    </div>
  );
};

export default LessonAdaptPage;
