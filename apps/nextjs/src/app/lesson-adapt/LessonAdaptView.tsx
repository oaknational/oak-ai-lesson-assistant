"use client";

import { useState } from "react";

import {
  AdaptChatSidebar,
  AdaptLessonContent,
} from "@/components/AppComponents/LessonAdapt";
import { ReviewModal } from "@/components/AppComponents/LessonAdapt/ReviewModal";
import {
  LessonAdaptStoreProvider,
  useLessonAdaptActions,
  useLessonAdaptStore,
} from "@/stores/lessonAdaptStore/LessonAdaptStoreProvider";

function LessonAdaptContent() {
  const [lessonIdInput, setLessonIdInput] = useState("");

  const actions = useLessonAdaptActions();
  const status = useLessonAdaptStore((state) => state.status);
  const error = useLessonAdaptStore((state) => state.error);
  const lessonData = useLessonAdaptStore((state) => state.lessonData);
  const slideContent = useLessonAdaptStore((state) => state.slideContent);
  const sessionId = useLessonAdaptStore((state) => state.sessionId);
  const duplicatedPresentationId = useLessonAdaptStore(
    (state) => state.duplicatedPresentationId,
  );
  const duplicatedPresentationUrl = useLessonAdaptStore(
    (state) => state.duplicatedPresentationUrl,
  );
  const thumbnails = useLessonAdaptStore((state) => state.thumbnails);
  const thumbnailsLoading = useLessonAdaptStore(
    (state) => state.thumbnailsLoading,
  );
  const thumbnailsError = useLessonAdaptStore((state) => state.thumbnailsError);
  const currentPlan = useLessonAdaptStore((state) => state.currentPlan);
  const previousPlanResponse = useLessonAdaptStore(
    (state) => state.previousPlanResponse,
  );
  const showReviewModal = useLessonAdaptStore((state) => state.showReviewModal);
  const approvedChangeIds = useLessonAdaptStore(
    (state) => state.approvedChangeIds,
  );

  const isLoading = status === "loading-lesson";
  const isReady = status === "ready" || status === "generating-plan";

  const handleFetch = () => {
    if (lessonIdInput.trim()) {
      actions.setLessonSlug(lessonIdInput);
      void actions.fetchLessonContent();
    }
  };

  // Build slide KLP mappings for the modal
  const slideKlpMappings =
    slideContent?.slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      slideId: slide.slideId,
      keyLearningPoints: slide.keyLearningPoints ?? [],
      learningCycles: slide.learningCycles ?? [],
      coversDiversity: slide.coversDiversity ?? false,
      slideType: slide.slideType ?? "",
    })) ?? [];

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
              value={lessonIdInput}
              onChange={(e) => setLessonIdInput(e.target.value)}
              placeholder="Enter lesson slug (e.g. 'identifying-equivalent-fractions')"
              className="flex-1 rounded border p-2"
            />
            <button
              onClick={handleFetch}
              disabled={!lessonIdInput.trim() || isLoading}
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

        {isReady && lessonData && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-semibold text-green-800">
              Lesson fetched successfully! Slide deck duplicated and ready for
              adaptation
            </p>
          </div>
        )}
      </div>

      {/* Main content area with chat and lesson content */}
      {isReady && lessonData && sessionId && (
        <div className="flex flex-1 overflow-hidden">
          <AdaptChatSidebar />
          <AdaptLessonContent
            presentationId={duplicatedPresentationId ?? ""}
            presentationUrl={duplicatedPresentationUrl ?? ""}
            lessonData={lessonData}
            thumbnails={thumbnails ?? undefined}
            thumbnailsLoading={thumbnailsLoading}
            thumbnailsError={thumbnailsError}
            slideKlpMappings={slideKlpMappings}
          />
        </div>
      )}

      {/* Debug info - collapsible */}
      {isReady && slideContent && (
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
                {JSON.stringify(slideContent, null, 2)}
              </pre>
            </details>
            <details className="rounded border bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold">
                Key learning points and learning cycles mapping
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">
                {JSON.stringify(slideKlpMappings, null, 2)}
              </pre>
            </details>
            <details className="rounded border bg-white p-2">
              <summary className="cursor-pointer text-xs font-semibold">
                Change plan for slides
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto text-xs">
                {JSON.stringify(previousPlanResponse, null, 2)}
              </pre>
            </details>
          </div>
        </details>
      )}

      {/* Review Modal */}
      {currentPlan && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => actions.setShowReviewModal(false)}
          plan={currentPlan}
          presentationId={duplicatedPresentationId ?? ""}
          presentationUrl={duplicatedPresentationUrl ?? ""}
          thumbnails={thumbnails}
          slideKlpMappings={slideKlpMappings}
          approvedChangeIds={approvedChangeIds}
          onToggleChange={actions.toggleChangeApproval}
          onApproveAll={actions.approveAllChanges}
          onRejectAll={actions.rejectAllChanges}
          onExecute={actions.executeAdaptations}
          isExecuting={status === "executing"}
        />
      )}
    </div>
  );
}

const LessonAdaptPage = () => {
  return (
    <LessonAdaptStoreProvider>
      <LessonAdaptContent />
    </LessonAdaptStoreProvider>
  );
};

export default LessonAdaptPage;
