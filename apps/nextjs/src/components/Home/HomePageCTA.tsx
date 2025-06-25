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
      <OakPrimaryButton
        element={Link}
        href="/aila/tools"
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
        Start creating with AI
      </OakPrimaryButton>
    </OakBox>
  );
};
