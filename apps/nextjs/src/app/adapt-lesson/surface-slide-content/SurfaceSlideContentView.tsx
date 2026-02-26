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
  OakTagFunctional,
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

function SurfaceSlideContent() {
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
                        title={`${formatSlideType(slide.slideType)} ${slide.learningCycles?.length ? `- ${slide.learningCycles.join(", ")}` : ""}`}
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
                              $background={
                                slidePlan?.isDeleted ? "grey10" : "white"
                              }
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
          </OakFlex>
        </OakMaxWidth>
      </>
    );
  }

  return (
    <LessonAdaptIntro
      introText="This is a prototype the AI enablement team have been working on to explore how well AI can identify key learning points (and slide based information) within Oak lessons, so that teachers can make AI adaptations without risking the integrity of the lesson."
      lessonIdInput={lessonIdInput}
      onLessonIdChange={setLessonIdInput}
      onFetch={handleFetch}
      isLoading={isLoading}
      error={error}
    />
  );
}

const SurfaceSlideContentView = () => {
  return (
    <LessonAdaptStoreProvider>
      <SurfaceSlideContent />
    </LessonAdaptStoreProvider>
  );
};

export default SurfaceSlideContentView;
