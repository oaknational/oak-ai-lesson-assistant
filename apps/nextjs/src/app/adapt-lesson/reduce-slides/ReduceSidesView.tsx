"use client";

import { useState } from "react";

import type { AdaptationPlan } from "@oakai/lesson-adapters";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakLoadingSpinner,
  OakMaxWidth,
  OakOL,
  OakP,
  OakSmallPrimaryButton,
  OakSpan,
} from "@oaknational/oak-components";

import type { SlidePlan } from "@/components/AppComponents/LessonAdapt/AdaptSlideCard";
import {
  AdaptSlideCard,
  formatSlideType,
  getSummary,
} from "@/components/AppComponents/LessonAdapt/AdaptSlideCard";
import { LessonDetailsCard } from "@/components/AppComponents/LessonAdapt/LessonDetailsCard";
import { LessonAdaptIntro } from "@/components/AppComponents/LessonAdapt/lesson-adapt-intro";
import {
  LessonAdaptStoreProvider,
  useLessonAdaptActions,
  useLessonAdaptStore,
} from "@/stores/lessonAdaptStore/LessonAdaptStoreProvider";
import type { UserSlideDeletion } from "@/stores/lessonAdaptStore/types";
import { extractLessonSlugFromInput } from "@/utils/extract-lesson-slug";

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
    const lessonSlug = extractLessonSlugFromInput(lessonIdInput);

    if (lessonSlug) {
      actions.setLessonSlug(lessonSlug);
      setLessonIdInput(lessonSlug);
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
              <LessonDetailsCard
                keyLearningPoints={lessonData?.keyLearningPoints ?? []}
                keywords={lessonData?.keywords ?? []}
                misconceptions={lessonData?.misconceptions ?? []}
                selectedKlps={selectedKlps}
              />
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
                      void actions.clearPlan();
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
                  {slideContent.slides?.map((slide, index) => {
                    const slidePlan = getSlideCardPlan(
                      slide.slideId,
                      currentPlan,
                      userSlideDeletions,
                    );
                    return (
                      <AdaptSlideCard
                        key={`slide-${slide.slideId}-${index}`}
                        title={`${slide.slideNumber}: ${formatSlideType(slide.slideType)}`}
                        isDeleted={slidePlan?.isDeleted}
                        thumbnailsLoading={thumbnailsLoading}
                        thumbnailUrl={
                          thumbnails?.find(
                            (t) => t.slideIndex === slide.slideNumber - 1,
                          )?.thumbnailUrl
                        }
                      >
                        {getSummary(slidePlan, slide.slideType)}
                        {slide.keyLearningPoints &&
                          slide.keyLearningPoints.length > 0 && (
                            <OakBox
                              $mt="spacing-16"
                              $borderRadius="border-radius-s"
                              $ba="border-solid-s"
                              $borderColor="border-neutral-lighter"
                              $pa="spacing-12"
                              $background={"grey10"}
                            >
                              <OakP $font="body-2" $mb="spacing-4">
                                <OakSpan $font="body-3-bold">
                                  Key learning points:
                                </OakSpan>
                              </OakP>
                              <OakOL $ml="spacing-16">
                                {slide.keyLearningPoints.map((point, i) => (
                                  <OakLI key={i} $font="body-3">
                                    {point}
                                  </OakLI>
                                ))}
                              </OakOL>
                            </OakBox>
                          )}
                      </AdaptSlideCard>
                    );
                  })}
                </OakFlex>
              )}
            </OakFlex>
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
                      Change plan for slides
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto text-xs">
                      {JSON.stringify(previousPlanResponse, null, 2)}
                    </pre>
                  </details>
                </div>
              </details>
            )}
          </OakFlex>
        </OakMaxWidth>
      </>
    );
  }

  return (
    <LessonAdaptIntro
      introText="This is a prototype the AI enablement team have been working on to explore how well AI can identify key learning points (and slide based information) within Oak lessons, so that teachers can make AI adaptations without risking the integrity of the lesson."
      introTextSecondary="Please try adapting a few lessons and see what you think. We'd love to hear your feedback and ideas for how we might integrate AI adaptations in the future."
      lessonIdInput={lessonIdInput}
      onLessonIdChange={setLessonIdInput}
      onFetch={handleFetch}
      isLoading={isLoading}
      error={error}
    />
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
