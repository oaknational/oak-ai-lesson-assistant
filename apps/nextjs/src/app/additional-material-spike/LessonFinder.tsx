"use client";

import { useState } from "react";

import {
  OakFlex,
  OakGrid,
  OakGridArea,
  OakTextInput,
  OakHeading,
  OakSpan,
  OakPrimaryButton,
} from "@oaknational/oak-components";
import Link from "next/link";

import { fetchOakLessons } from "../actions";

const LessonFinder = ({ lessons }: { lessons: any }) => {
  const [searchText, setSearchText] = useState("");
  const [owaLessons, setOwaLessons] = useState([]);
  const lessonTitles = lessons.map((lesson: any) => ({
    sessionId: lesson.id,
    lessonTitle: lesson?.output?.lessonPlan?.title || "",
    keyStage: lesson?.output?.lessonPlan?.keyStage || "",
    subject: lesson?.output?.lessonPlan?.subject || "",
    basedOn: lesson?.output?.lessonPlan?.basedOn?.title || "",
    hasThreeCycles:
      !!lesson?.output?.lessonPlan?.cycle1 &&
      !!lesson?.output?.lessonPlan?.cycle2 &&
      !!lesson?.output?.lessonPlan?.cycle3,
  }));

  console.log("**********", lessons[lessons.length - 1]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/search-lesson?q=${searchText}`);
      const data = await response.json();
      console.log("data", data);

      setOwaLessons(data);
    } catch (e) {
      console.error("Error fetching lessons:", e);
    }
  };

  return (
    <OakFlex $flexDirection="column" $mb="space-between-m">
      <OakFlex
        $gap={"space-between-m"}
        $flexDirection={"column"}
        $mb="space-between-m"
      >
        <OakHeading tag="h1">Choose a Oak lesson to test</OakHeading>
        <OakTextInput onChange={(value) => setSearchText(value.target.value)} />
        <OakPrimaryButton onClick={handleSubmit}>Submit</OakPrimaryButton>
        {searchText &&
          owaLessons &&
          owaLessons.map((lesson: any) => (
            <Link href={`/additional-material-spike/owa/${lesson.lessonSlug}`}>
              {lesson.lessonTitle}
            </Link>
          ))}
      </OakFlex>
      <OakHeading tag="h1">Choose a Aila lesson to test</OakHeading>
      <OakSpan $mb="space-between-m" $font={"body-3"}>
        {lessonTitles.map(
          ({
            sessionId,
            lessonTitle,
            hasThreeCycles,
            keyStage,
            subject,
            basedOn,
          }: {
            sessionId: string;
            lessonTitle: string;
            hasThreeCycles: boolean;
            keyStage: string;
            subject: string;
            basedOn: string;
          }) => {
            if (!lessonTitle || !hasThreeCycles) {
              return null;
            }
            return (
              <Link
                key={sessionId}
                href={`/additional-material-spike/${sessionId}`}
              >
                {lessonTitle}: {sessionId} ------- {subject}, {keyStage}, BASED
                ON: {basedOn}
              </Link>
            );
          },
        )}
      </OakSpan>
    </OakFlex>
  );
};

export default LessonFinder;
