"use client";

import { useState } from "react";

import type { AdaptationPlan } from "@oakai/lesson-adapters";

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
  OakSmallPrimaryButton,
  OakSmallSecondaryButton,
  OakSpan,
} from "@oaknational/oak-components";

import type { SlidePlan } from "@/components/AppComponents/LessonAdapt/AdaptSlideCard";
import { AdaptSlideCard } from "@/components/AppComponents/LessonAdapt/AdaptSlideCard";
import {
  LessonAdaptStoreProvider,
  useLessonAdaptActions,
  useLessonAdaptStore,
} from "@/stores/lessonAdaptStore/LessonAdaptStoreProvider";
import type { UserSlideDeletion } from "@/stores/lessonAdaptStore/types";

function getSlideCardPlan(
  slideId: string,
  plan: AdaptationPlan | null,
  userSlideDeletions: UserSlideDeletion[],
): SlidePlan {
  const userDeletion = userSlideDeletions.find((d) => d.slideId === slideId);
  if (userDeletion) {
    return {
      isDeleted: true,
      source: "user",
      reasoning: userDeletion.reasoning,
    };
  }

  if (!plan) return null;

  const { changes } = plan.slidesAgentResponse;

  const aiDeletion = changes.slideDeletions.find((d) => d.slideId === slideId);
  if (aiDeletion) {
    return { isDeleted: true, source: "ai", reasoning: aiDeletion.reasoning };
  }

  const kept = changes.slidesToKeep.find((k) => k.slideId === slideId);
  if (kept) {
    return { isDeleted: false, source: "ai", reasoning: kept.reasoning };
  }

  return null;
}

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
  const userSlideDeletions = useLessonAdaptStore(
    (state) => state.userSlideDeletions,
  );

  const selectedKlps = useLessonAdaptStore((state) => state.selectedKlps);
  const selectedSlideIds = useLessonAdaptStore(
    (state) => state.selectedSlideIds,
  );

  const isLoading = status === "loading-lesson";
  const isReady = status === "ready" || status === "generating-plan";

  const handleFetch = () => {
    if (lessonIdInput.trim()) {
      actions.setLessonSlug(lessonIdInput);
      void actions.fetchLessonContent();
    }
  };

  if (isReady) {
    return (
      <>
        {/* Header bar */}
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
        <OakFlex
          $background="mint"
          $gap="spacing-16"
          $alignItems="center"
          $pa="spacing-24"
        >
          <OakMaxWidth>
            <OakFlex $flexDirection="column" $mt="spacing-16">
              <OakHeading tag="h1" $font="heading-3" $mb="spacing-12">
                {lessonData?.title}
              </OakHeading>
              <OakP $font="body-1" $color="text-subdued" $mb="spacing-16">
                {lessonData?.learningOutcome}
              </OakP>
            </OakFlex>
          </OakMaxWidth>
        </OakFlex>
        <OakMaxWidth>
          <OakFlex $flexDirection="column">
            {/* Main content */}
            <OakBox $mb="spacing-32" $mt="spacing-32">
              {/* Lesson details card */}
              <OakFlex
                $borderRadius="border-radius-m"
                // $bb="border-solid-s"
                $borderColor="border-neutral-lighter"
                $pa="spacing-24"
                $flexDirection={"column"}
                $background={"white"}
                $ba="border-solid-m"
              >
                <OakHeading tag="h2" $font="heading-5" $mb="spacing-24">
                  Lesson details
                </OakHeading>

                {/* Key learning points */}
                <OakBox $mb="spacing-48">
                  <OakHeading tag="h3" $font="heading-6" $mb="spacing-8">
                    Key learning points
                  </OakHeading>

                  <OakFlex
                    $font="body-3"
                    $flexDirection="column"
                    $gap="spacing-4"
                    $pa={"spacing-16"}
                    $background={"grey10"}
                  >
                    {lessonData?.keyLearningPoints.map((point, index) => (
                      <OakP key={index}>
                        {index + 1}. {point}
                      </OakP>
                    ))}
                  </OakFlex>
                  {selectedKlps.length <
                    (lessonData?.keyLearningPoints.length ?? 0) && (
                    <div className="border-amber-400 bg-amber-50 mt-4 rounded border-l-4 p-4">
                      <OakP $font="body-3" $color="text-primary">
                        If you select only {selectedKlps.length} key learning{" "}
                        {selectedKlps.length === 1 ? "point" : "points"} to
                        teach, the lesson outcome may not be achieved.
                      </OakP>
                    </div>
                  )}
                </OakBox>

                {/* Keywords */}
                <OakBox $mb="spacing-48">
                  <OakHeading tag="h3" $font="heading-6" $mb="spacing-16">
                    Keywords
                  </OakHeading>
                  <OakFlex
                    $flexDirection="column"
                    $gap="spacing-4"
                    $maxWidth="spacing-640"
                  >
                    {lessonData?.keywords.map((kw, index) => (
                      <OakP key={index} $font="body-3">
                        <OakSpan $font="body-3-bold">{kw.keyword}</OakSpan> -{" "}
                        {kw.definition}
                      </OakP>
                    ))}
                  </OakFlex>
                </OakBox>

                {/* Common misconception */}
                {lessonData?.misconceptions[0] && (
                  <OakBox>
                    <OakHeading tag="h3" $font="heading-6" $mb="spacing-16">
                      Common misconception
                    </OakHeading>
                    <OakP $font="body-3" $mb="spacing-4">
                      <OakSpan $font="body-3-bold">
                        {lessonData.misconceptions[0].misconception}
                      </OakSpan>
                    </OakP>
                    <OakP $font="body-3">
                      {lessonData.misconceptions[0].description}
                    </OakP>
                  </OakBox>
                )}
              </OakFlex>
            </OakBox>

            {/* Lesson slides */}
            <OakFlex $flexDirection={"column"}>
              <OakHeading tag="h2" $font="heading-5" $mb="spacing-4">
                Lesson slides
              </OakHeading>
              <OakP $font="body-3" $color="text-subdued">
                {selectedSlideIds.length} of {slideContent?.slides.length ?? 0}{" "}
                slides included
              </OakP>

              {/* Streamline option */}
              <OakFlex
                $gap={"spacing-16"}
                $flexDirection={"row"}
                $pv="spacing-16"
              >
                <OakSmallPrimaryButton
                  onClick={() => {
                    if (currentPlan) {
                      console.log(
                        "Rejecting all changes and keeping all slides",
                      );
                      void actions.rejectAllChanges();
                    } else {
                      console.log(
                        "Generating plan to remove non essential slides",
                      );
                      void actions.generatePlan(`Remove non essential slides`);
                    }
                  }}
                  disabled={status === "generating-plan"}
                >
                  {currentPlan ? "Reset to all slides" : "Reduce slides"}
                </OakSmallPrimaryButton>
                {currentPlan && (
                  <OakSmallSecondaryButton
                    onClick={() => void actions.executeAdaptations()}
                  >
                    Except changes and modify slide
                  </OakSmallSecondaryButton>
                )}
              </OakFlex>

              {/* Slide cards */}
              {status === "generating-plan" && (
                <OakFlex
                  $mb={"spacing-80"}
                  $alignItems="center"
                  $gap="spacing-4"
                >
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
                      slidePlan={getSlideCardPlan(
                        slide.slideId,
                        currentPlan,
                        userSlideDeletions,
                      )}
                    />
                  ))}
                </OakFlex>
              )}
            </OakFlex>
          </OakFlex>
        </OakMaxWidth>
      </>
    );
  }

  return (
    <OakMaxWidth>
      <OakFlex $flexDirection="column" className="min-h-screen">
        <OakBox
          $pv="spacing-32"
          $ph="spacing-64"
          $bb="border-solid-s"
          $borderColor="border-neutral-lighter"
        >
          <OakHeading tag="h1" $font="heading-3" $mb="spacing-24">
            Lesson AI adaptations
          </OakHeading>

          <OakBox $mb="spacing-32">
            <OakP $font="body-1" $mb="spacing-16">
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

          <OakBox $mb="spacing-16">
            <label htmlFor="lesson-slug-input">
              <OakP $font="heading-7" $mb="spacing-8">
                Lesson ID (Lesson slug):
              </OakP>
            </label>
            <OakFlex $gap="spacing-12" $alignItems="center">
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
            <OakBox
              $background="bg-decorative2-very-subdued"
              $bl="border-solid-l"
              $borderColor="border-decorative2-stronger"
              $pa="spacing-16"
              $mt="spacing-16"
              $borderRadius="border-radius-s"
            >
              <OakP $font="body-2">
                Fetching lesson data... This may take some time.
              </OakP>
            </OakBox>
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
