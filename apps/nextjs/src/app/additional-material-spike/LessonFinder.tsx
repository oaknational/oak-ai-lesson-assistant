"use client";

import { useState } from "react";

import {
  OakFlex,
  OakTextInput,
  OakHeading,
  OakPrimaryButton,
} from "@oaknational/oak-components";
import Link from "next/link";

const LessonFinder = ({ lessons }: { lessons: any }) => {
  const [searchText, setSearchText] = useState("");
  const [owaLessons, setOwaLessons] = useState([]);
  const lessonTitles = lessons.map((lesson: any) => ({
    sessionId: lesson.id,
    lessonTitle: lesson?.output?.lessonPlan?.title ?? "",
    keyStage: lesson?.output?.lessonPlan?.keyStage ?? "",
    subject: lesson?.output?.lessonPlan?.subject ?? "",
    hasThreeCycles:
      !!lesson?.output?.lessonPlan?.cycle1 &&
      !!lesson?.output?.lessonPlan?.cycle2 &&
      !!lesson?.output?.lessonPlan?.cycle3,
  }));

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/search-lesson?q=${searchText}`);
      const data = await response.json();

      setOwaLessons(data);
    } catch (e) {
      console.error("Error fetching lessons:", e);
    }
  };

  return (
    <OakFlex
      $mh="space-between-m"
      $flexDirection="column"
      $mb="space-between-m"
    >
      <OakFlex
        $gap={"space-between-m"}
        $flexDirection={"column"}
        $mb="space-between-m"
      >
        <OakHeading $font={"heading-5"} tag="h1">
          Choose a Oak lesson to test
        </OakHeading>
        <OakTextInput onChange={(value) => setSearchText(value.target.value)} />
        <OakPrimaryButton onClick={handleSubmit}>Search</OakPrimaryButton>
        {searchText &&
          owaLessons &&
          owaLessons.map((lesson: any) => (
            <Link href={`/additional-material-spike/owa/${lesson.lessonSlug}`}>
              {`${lesson.lessonTitle} - ${lesson.units[0].keyStageSlug} - ${lesson.units[0].subjectSlug}`}
            </Link>
          ))}
      </OakFlex>
      <OakFlex
        $gap={"space-between-m"}
        $flexDirection={"column"}
        $mb="space-between-m"
      >
        <OakHeading $font={"heading-5"} tag="h1">
          Choose a Aila lesson to test
        </OakHeading>
        {lessonTitles.map(
          ({
            sessionId,
            lessonTitle,
            hasThreeCycles,
            keyStage,
            subject,
          }: {
            sessionId: string;
            lessonTitle: string;
            hasThreeCycles: boolean;
            keyStage: string;
            subject: string;
          }) => {
            if (!lessonTitle || !hasThreeCycles) {
              return null;
            }
            return (
              // <OakSpan $mb="space-between-s" $font={"body-3"}>
              <Link
                key={sessionId}
                href={`/additional-material-spike/${sessionId}`}
              >
                {lessonTitle}: {sessionId} : {subject}, {keyStage},
              </Link>
              // </OakSpan>
            );
          },
        )}
      </OakFlex>
    </OakFlex>
  );
};

export default LessonFinder;
