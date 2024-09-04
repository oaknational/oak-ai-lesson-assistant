"use client";

import { useUser } from "@clerk/nextjs";
import { OakBox, OakPrimaryButton } from "@oaknational/oak-components";
import Link from "next/link";

import useAnalytics from "@/lib/analytics/useAnalytics";

export const HomePageCTA = () => {
  const user = useUser();
  const { track } = useAnalytics();

  return (
    <OakBox $mt="space-between-s">
      {user.isLoaded && !user.isSignedIn ? (
        <OakPrimaryButton
          iconName="arrow-right"
          isTrailingIcon={true}
          aria-disabled="true"
        >
          Coming soon...
        </OakPrimaryButton>
      ) : (
        <OakPrimaryButton
          element={Link}
          href="/aila"
          iconName="arrow-right"
          isTrailingIcon={true}
          onClick={() => {
            track.lessonAssistantAccessed({
              product: "ai lesson assistant",
              isLoggedIn: !!user.isSignedIn,
              componentType: "homepage_secondary_create_a_lesson_button",
            });
          }}
        >
          Get started
        </OakPrimaryButton>
      )}
    </OakBox>
  );
};
