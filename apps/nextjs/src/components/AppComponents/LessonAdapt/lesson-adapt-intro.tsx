import type { FC, ReactNode } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLoadingSpinner,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";

type LessonAdaptIntroProps = {
  children: ReactNode;
  lessonIdInput: string;
  onLessonIdChange: (value: string) => void;
  onFetch: () => void;
  isLoading: boolean;
  error: Error | null;
};

export const LessonAdaptIntro: FC<LessonAdaptIntroProps> = ({
  children,
  lessonIdInput,
  onLessonIdChange,
  onFetch,
  isLoading,
  error,
}) => {
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

          <OakBox $mb="spacing-32">{children}</OakBox>

          <OakBox $mb="spacing-16">
            <label htmlFor="lesson-slug-input">
              <OakP $font="heading-7" $mb="spacing-8">
                Lesson URL or slug (e.g.
                use-the-language-of-equivalent-fractions-correctly):
              </OakP>
            </label>
            <OakFlex $gap="spacing-12" $alignItems="center">
              <input
                id="lesson-slug-input"
                type="text"
                value={lessonIdInput}
                onChange={(e) => onLessonIdChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onFetch()}
                placeholder="Lesson URL or slug (e.g. use-the-language-of-equivalent-fractions-correctly)"
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500"
              />
              <OakPrimaryButton
                onClick={onFetch}
                disabled={isLoading || !lessonIdInput.trim()}
              >
                {isLoading ? "Fetching..." : "Fetch lesson"}
              </OakPrimaryButton>
            </OakFlex>
          </OakBox>

          {isLoading && (
            <OakFlex
              $background="bg-decorative2-very-subdued"
              $bl="border-solid-l"
              $borderColor="border-decorative2-stronger"
              $pa="spacing-16"
              $mt="spacing-16"
              $borderRadius="border-radius-s"
              $flexDirection="row"
            >
              <OakLoadingSpinner />
              <OakP $ml="spacing-12" $font="body-2">
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
};
