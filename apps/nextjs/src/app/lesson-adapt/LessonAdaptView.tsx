"use client";

import { useState } from "react";

import { trpc } from "@/utils/trpc";

const LessonAdaptPage = () => {
  const [lessonId, setLessonId] = useState("");
  const [fetchedLessonId, setFetchedLessonId] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.lessonAdapt.getLessonContent.useQuery(
    { lessonId: fetchedLessonId ?? "" },
    { enabled: !!fetchedLessonId },
  );

  const handleFetch = () => {
    if (lessonId.trim()) {
      console.log("Fetching lesson with ID:", lessonId);
      setFetchedLessonId(lessonId);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Lesson Adapt</h1>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Lesson ID (Lesson Slug):
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
            className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2"
          >
            {isLoading ? "Loading..." : "Fetch Lesson"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">Error:</p>
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="rounded border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-800">
              Lesson fetched successfully!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Slide deck duplicated and ready for adaptation
            </p>
          </div>

          {/* Embedded Google Slides */}
          <div className="rounded border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lesson Slides</h2>
              <a
                href={data.presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                Open in Google Slides ↗
              </a>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded border">
              <iframe
                src={`https://docs.google.com/presentation/d/${data.presentationId}/embed?start=false&loop=false&delayms=3000`}
                className="h-full w-full"
                allowFullScreen
                title="Lesson Slides"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Presentation ID: {data.presentationId}
            </p>
          </div>

          <details className="rounded border bg-gray-50 p-4">
            <summary className="cursor-pointer font-semibold">
              Raw Lesson Data (Click to expand)
            </summary>
            <pre className="mt-2 overflow-auto text-xs">
              {JSON.stringify(data.lessonData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default LessonAdaptPage;
