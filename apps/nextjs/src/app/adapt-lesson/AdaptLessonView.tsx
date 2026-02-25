"use client";

import { useState } from "react";

import {
  OakBox,
  OakCheckBox,
  OakFlex,
  OakHeading,
  OakLoadingSpinner,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";

import { AdaptSlideCard } from "@/components/AppComponents/LessonAdapt/AdaptSlideCard";
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

  const selectedKlps = useLessonAdaptStore((state) => state.selectedKlps);
  const selectedSlideIds = useLessonAdaptStore(
    (state) => state.selectedSlideIds,
  );

  const isLoading = status === "loading-lesson";
  const isReady = status === "ready" || status === "generating-plan";

  const planBySlide = slideContent?.slides.map((slide) => {
    return {
      slideId: slide.slideId,
      deleted: currentPlan?.slidesAgentResponse.changes.slideDeletions.find(
        (deletion) => deletion.slideId === slide.slideId,
      ),
      textEdits: currentPlan?.slidesAgentResponse.changes.textEdits.filter(
        (edit) => edit.slideId === slide.slideId,
      ),
      tableCellEdits:
        currentPlan?.slidesAgentResponse.changes.tableCellEdits.filter(
          (edit) => edit.slideId === slide.slideId,
        ),
      slideToKeep: currentPlan?.slidesAgentResponse.changes.slidesToKeep.find(
        (keep) => keep.slideId === slide.slideId,
      ),
    };
  });

  const handleFetch = () => {
    if (lessonIdInput.trim()) {
      actions.setLessonSlug(lessonIdInput);
      void actions.fetchLessonContent();
    }
  };

  if (isReady) {
    return (
      <OakMaxWidth>
        <OakFlex $flexDirection="column" className="min-h-screen">
          {/* Header bar */}
          <div className="flex justify-end border-b border-gray-200 bg-white px-6 py-4">
            <OakSecondaryButton onClick={() => actions.reset()}>
              Fetch new lesson
            </OakSecondaryButton>
          </div>

          {/* Green banner */}
          <div className="border-b border-black/10 bg-[#BEF2BD] px-16 py-6">
            <OakHeading tag="h1" $font="heading-3" $mb="spacing-8">
              {lessonData?.title}
            </OakHeading>
            <OakP $font="body-1" $color="text-subdued">
              {lessonData?.learningOutcome}
            </OakP>
          </div>

          {/* Main content */}
          <div className="px-16 py-8">
            {/* Lesson details card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <OakHeading tag="h2" $font="heading-4" $mb="spacing-24">
                Lesson details
              </OakHeading>

              {/* Key learning points */}
              <OakBox $mb="spacing-48">
                <OakHeading tag="h3" $font="heading-5" $mb="spacing-8">
                  Key learning points
                </OakHeading>
                <OakP $font="body-2" $mb="spacing-8" $color="text-subdued">
                  Select key learning points required for your lesson.
                </OakP>
                <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                  {lessonData?.keyLearningPoints.map((point, index) => (
                    <>
                      <OakCheckBox
                        id={point}
                        value={point}
                        onChange={() => actions.toggleKlp(point)}
                        checked={selectedKlps.includes(point)}
                      />
                    </>
                  ))}
                </div>
                {selectedKlps.length <
                  (lessonData?.keyLearningPoints.length ?? 0) && (
                  <div className="border-amber-400 bg-amber-50 mt-4 rounded border-l-4 p-4">
                    <OakP $font="body-2" $color="text-primary">
                      If you select only {selectedKlps.length} key learning{" "}
                      {selectedKlps.length === 1 ? "point" : "points"} to teach,
                      the lesson outcome may not be achieved.
                    </OakP>
                  </div>
                )}
              </OakBox>

              {/* Keywords */}
              <OakBox $mb="spacing-48">
                <OakHeading tag="h3" $font="heading-5" $mb="spacing-16">
                  Keywords
                </OakHeading>
                <OakFlex
                  $flexDirection="column"
                  $gap="spacing-4"
                  $maxWidth="spacing-640"
                >
                  {lessonData?.keywords.map((kw, index) => (
                    <OakP key={index} $font="body-1">
                      <OakSpan $font="body-1-bold">{kw.keyword}</OakSpan> -{" "}
                      {kw.definition}
                    </OakP>
                  ))}
                </OakFlex>
              </OakBox>

              {/* Common misconception */}
              {lessonData?.misconceptions[0] && (
                <OakBox>
                  <OakHeading tag="h3" $font="heading-5" $mb="spacing-16">
                    Common misconception
                  </OakHeading>
                  <OakP $font="body-1" $mb="spacing-4">
                    <OakSpan $font="body-1-bold">
                      {lessonData.misconceptions[0].misconception}
                    </OakSpan>
                  </OakP>
                  <OakP $font="body-1">
                    {lessonData.misconceptions[0].description}
                  </OakP>
                </OakBox>
              )}
            </div>
          </div>

          {/* Lesson slides */}
          <div className="px-16 pb-16 pt-8">
            <OakHeading tag="h2" $font="heading-4" $mb="spacing-4">
              Lesson slides
            </OakHeading>
            <OakP $font="body-2" $color="text-subdued" $mb="spacing-16">
              {selectedSlideIds.length} of {slideContent?.slides.length ?? 0}{" "}
              slides included
            </OakP>

            {/* Streamline option */}
            <div className="border-purple-200 mb-6 flex items-center justify-between rounded-lg border-2 bg-white p-4">
              <OakP $font="body-1">
                Streamline slide deck, while keeping the key learning points you
                have selected above.
              </OakP>
              <OakPrimaryButton
                onClick={() =>
                  void actions.generatePlan(`Remove non essential slides while`)
                }
                disabled={status === "generating-plan"}
              >
                Streamline Slide Deck
              </OakPrimaryButton>
            </div>

            {/* Slide cards */}
            {status === "generating-plan" && (
              <OakFlex $alignItems="center" $gap="spacing-4" $mb="spacing-16">
                <OakLoadingSpinner />
                <OakP $font="body-2">Generating adaptation plan...</OakP>
              </OakFlex>
            )}
            {slideContent && status !== "generating-plan" && (
              <OakFlex $flexDirection="column" $gap="spacing-24">
                {slideContent.slides?.map((slide, index) => (
                  <AdaptSlideCard
                    key={`slide-${slide.slideId}-${index}`}
                    slide={slide}
                    thumbnailsLoading={thumbnailsLoading}
                    thumbnailUrl={
                      thumbnails?.find(
                        (t) => t.slideIndex === slide.slideNumber - 1,
                      )?.thumbnailUrl
                    }
                    isIncluded={selectedSlideIds.includes(slide.slideId)}
                    slidePlan={planBySlide?.find(
                      (s) => s.slideId === slide.slideId,
                    )}
                  />
                ))}
              </OakFlex>
            )}
          </div>
        </OakFlex>
      </OakMaxWidth>
    );
  }

  return (
    <OakMaxWidth>
      <OakFlex $flexDirection="column" className="min-h-screen">
        <OakBox $pa="spacing-24">
          <OakHeading tag="h1" $font="heading-3" $mb="spacing-8">
            Lesson AI adaptations
          </OakHeading>

          <OakBox $mb="spacing-8">
            <OakP $font="body-1" $mb="spacing-4">
              This is a prototype the AI enablement team have been working on to
              explore how well AI can identify key learning points (and slide
              based information) within Oak lessons, so that teachers can make
              AI adaptations without risking the integrity of the lesson.
            </OakP>
            <OakP $font="body-1">
              Please try adapting a few lessons and see what you think.
              We&apos;d love to hear your feedback and ideas for how we might
              integrate AI adaptations in the future.
            </OakP>
          </OakBox>

          <OakBox $mb="spacing-8">
            <label htmlFor="lesson-slug-input">
              <OakP $font="heading-7" $mb="spacing-4">
                Lesson ID (Lesson slug):
              </OakP>
            </label>
            <OakFlex $gap="spacing-8" $alignItems="center">
              <input
                id="lesson-slug-input"
                type="text"
                value={lessonIdInput}
                onChange={(e) => setLessonIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="Enter lesson slug (e.g. 'identifying-equivalent-fractions')"
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
              />
              <OakPrimaryButton
                onClick={handleFetch}
                disabled={isLoading || !lessonIdInput.trim()}
              >
                {isLoading ? "Fetching..." : "Fetch lesson"}
              </OakPrimaryButton>
            </OakFlex>
          </OakBox>

          {isLoading && (
            <OakFlex
              $alignItems="center"
              $gap="spacing-4"
              $pa="spacing-8"
              $background="bg-decorative1-subdued"
            >
              <OakLoadingSpinner />
              <OakP $font="body-2">
                Fetching lesson data... This may take some time.
              </OakP>
            </OakFlex>
          )}

          {error && !isLoading && (
            <OakBox
              $pa="spacing-8"
              $background="bg-decorative5-subdued"
              $borderRadius="border-radius-m"
            >
              <OakP $font="body-2" $color="text-error">
                {error.message}
              </OakP>
            </OakBox>
          )}
        </OakBox>
      </OakFlex>
    </OakMaxWidth>
  );
}

const AdaptLessonView = () => {
  return (
    <LessonAdaptStoreProvider>
      <LessonAdaptContent />
    </LessonAdaptStoreProvider>
  );
};

export default AdaptLessonView;
