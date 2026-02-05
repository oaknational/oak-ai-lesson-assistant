"use client";

import { useState } from "react";

import {
  OakBox,
  OakFlex,
  OakHeading,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";

import { LessonDetailsTab } from "./LessonDetailsTab";
import { SlidesTab } from "./SlidesTab";
import { ThumbnailsTab } from "./ThumbnailsTab";

interface LessonData {
  keyStage: string;
  subject: string;
  title: string;
  learningOutcome: string;
  learningCycles: string[];
  keyLearningPoints: string[];
  keywords: Array<{
    keyword: string;
    definition: string;
  }>;
  misconceptions: Array<{
    misconception: string;
    description: string;
  }>;
}

interface Thumbnail {
  objectId: string;
  slideIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface AdaptLessonContentProps {
  presentationId: string;
  presentationUrl: string;
  lessonData: LessonData;
  thumbnails: Thumbnail[] | undefined;
  thumbnailsError: { message: string } | null;
  thumbnailsLoading?: boolean;
}

const tabs = ["Lesson details", "Slides", "Thumbnails"];

export function AdaptLessonContent({
  presentationId,
  presentationUrl,
  lessonData,
  thumbnails,
  thumbnailsLoading = false,
  thumbnailsError = null,
}: AdaptLessonContentProps) {
  const [activeTab, setActiveTab] = useState<string>("Lesson details");

  return (
    <OakFlex
      $flexDirection="column"
      $height="100%"
      $flexGrow={1}
      $overflowY="auto"
    >
      {/* Header section */}
      <OakBox
        $background="bg-decorative1-subdued"
        $pa="spacing-24"
        $pb="spacing-24"
      >
        <OakBox $maxWidth="100%">
          {/* Key stage label */}
          <OakP $font="heading-7" $mb="spacing-24">
            {lessonData?.keyStage && lessonData?.subject
              ? `${lessonData.keyStage} ${lessonData.subject}`
              : "Loading..."}
          </OakP>

          {/* Title */}
          <OakHeading tag="h1" $font="heading-3" $mb="spacing-24">
            {lessonData?.title ?? "Loading..."}
          </OakHeading>
        </OakBox>
      </OakBox>

      {/* Tabs section */}
      <OakBox $background="white" $pa="spacing-24" $pb="spacing-24">
        <OakFlex $gap="spacing-12" $flexWrap="wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 transition-colors ${
                activeTab === tab
                  ? "border-grey-500 border-2 bg-white"
                  : "bg-grey-300"
              }`}
            >
              <OakP $font="heading-7">{tab}</OakP>
            </button>
          ))}
        </OakFlex>
      </OakBox>

      {/* Content section */}
      <OakBox
        $height={"100%"}
        $background="white"
        $pa="spacing-24"
        $pb="spacing-24"
      >
        <OakBox $height="100%" $maxWidth="100%">
          {activeTab === "Lesson details" && (
            <LessonDetailsTab data={lessonData} />
          )}
          {activeTab === "Slides" && presentationId && (
            <SlidesTab
              presentationId={presentationId}
              presentationUrl={presentationUrl}
            />
          )}
          {activeTab === "Thumbnails" && (
            <ThumbnailsTab
              thumbnails={thumbnails}
              isLoading={thumbnailsLoading}
              error={thumbnailsError}
            />
          )}
        </OakBox>
      </OakBox>
    </OakFlex>
  );
}
