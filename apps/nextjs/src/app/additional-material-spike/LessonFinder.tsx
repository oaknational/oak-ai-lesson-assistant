"use client";

import { useEffect, useState } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { OakFlex, OakHeading, OakTextInput } from "@oaknational/oak-components";
import Link from "next/link";

import { trpc } from "@/utils/trpc";

import type { OakOpenApiSearchSchema } from "../../../../../packages/additional-materials/src/schemas";

type Lesson = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  appId: string;
  deletedAt: Date | null;
  userId: string;
  output: { lessonPlan: LooseLessonPlan } | null;
};

const LessonFinder = ({ lessons }: { lessons: Lesson[] }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [owaLessons, setOwaLessons] = useState<OakOpenApiSearchSchema | []>();
  const { data, isLoading } = trpc.additionalMaterials.searchOWALesson.useQuery(
    { query: searchText },
    { enabled: !!searchText }, // Run query only when searchText is not empty
  );
  const lessonTitles = lessons.map((lesson: Lesson) => ({
    sessionId: lesson.id,
    lessonTitle: lesson?.output?.lessonPlan?.title ?? "",
    keyStage: lesson?.output?.lessonPlan?.keyStage ?? "",
    subject: lesson?.output?.lessonPlan?.subject ?? "",
    hasThreeCycles:
      !!lesson?.output?.lessonPlan?.cycle1 &&
      !!lesson?.output?.lessonPlan?.cycle2 &&
      !!lesson?.output?.lessonPlan?.cycle3,
  }));

  useEffect(() => {
    if (data && data !== owaLessons) {
      setOwaLessons(data);
    }
  }, [data, owaLessons]);

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
        <OakTextInput onChange={(e) => setSearchText(e.target.value)} />

        {searchText &&
          owaLessons &&
          owaLessons.map((lesson: OakOpenApiSearchSchema[number]) => (
            <Link href={`/additional-material-spike/owa/${lesson.lessonSlug}`}>
              {`${lesson.lessonTitle} - ${lesson?.units[0]?.keyStageSlug} - ${lesson?.units[0]?.subjectSlug}`}
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
              <Link
                key={sessionId}
                href={`/additional-material-spike/${sessionId}`}
              >
                {lessonTitle}: {sessionId} : {subject}, {keyStage},
              </Link>
            );
          },
        )}
      </OakFlex>
    </OakFlex>
  );
};

export default LessonFinder;
