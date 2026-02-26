"use client";

/* eslint-disable no-console */
import { useState } from "react";

import { OakFlex, OakSmallPrimaryButton } from "@oaknational/oak-components";

import {
  AdaptChatSidebar,
  AdaptLessonContent,
} from "@/components/AppComponents/LessonAdapt";
import { ReviewModal } from "@/components/AppComponents/LessonAdapt/ReviewModal";
import { LessonAdaptIntro } from "@/components/AppComponents/LessonAdapt/lesson-adapt-intro";
import {
  LessonAdaptStoreProvider,
  useLessonAdaptActions,
  useLessonAdaptStore,
} from "@/stores/lessonAdaptStore/LessonAdaptStoreProvider";
import { extractLessonSlugFromInput } from "@/utils/extract-lesson-slug";

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
    const lessonSlug = extractLessonSlugFromInput(lessonIdInput);

    if (lessonSlug) {
      actions.setLessonSlug(lessonSlug);
      setLessonIdInput(lessonSlug);
      void actions.fetchLessonContent();
    }
  };

  const slideKlpMappings = slideContent?.slides ?? [];

  return (
    <div className="flex h-screen flex-col">
      {/* Main content area with chat and lesson content */}
      {!isReady && (
        <LessonAdaptIntro
          introText="This is a prototype the AI enablement team have been working on to explore how well AI can identify key learning points (and slide based information) within Oak lessons, so that teachers can make AI adaptations without risking the integrity of the lesson."
          lessonIdInput={lessonIdInput}
          onLessonIdChange={setLessonIdInput}
          onFetch={handleFetch}
          isLoading={isLoading}
          error={error}
        />
      )}
      {isReady && lessonData && sessionId && (
        <>
          <OakFlex
            $alignItems="end"
            $justifyContent={"end"}
            $ph="spacing-24"
            $pv="spacing-16"
          >
            <OakSmallPrimaryButton onClick={() => actions.reset()}>
              Fetch new lesson
            </OakSmallPrimaryButton>
          </OakFlex>
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
        </>
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
