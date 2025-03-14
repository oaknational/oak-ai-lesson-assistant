"use client";

import { useEffect, useState } from "react";

import { LessonPlanSchemaWhilstStreaming } from "@oakai/aila/src/protocol/schema";

import { OakFlex, OakHeading, OakTextInput } from "@oaknational/oak-components";
import type { JsonValue } from "@prisma/client/runtime/library";
import Link from "next/link";

import { trpc } from "@/utils/trpc";

import type { OakOpenApiSearchSchema } from "../../../../../packages/additional-materials/src/schemas";

const getLessonTitle = (lessons: Lesson[]) => {
  const lessonTitles = lessons.map((lesson) => {
    const parsedLesson = LessonPlanSchemaWhilstStreaming.parse({
      // "@ts-expect-error"
      ...lesson?.output?.lessonPlan,
    });

    return {
      sessionId: lesson.id ?? "",
      lessonTitle: parsedLesson.title ?? "",
      keyStage: parsedLesson.keyStage ?? "",
      subject: parsedLesson.subject ?? "",
      hasThreeCycles:
        !!parsedLesson.cycle1 && !!parsedLesson.cycle2 && !!parsedLesson.cycle3,
    };
  });

  return lessonTitles;
};

type Lesson = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  appId: string;
  deletedAt: Date | null;
  userId: string;
  output: JsonValue | null;
};

const LessonFinder = ({ lessons }: { lessons: Lesson[] }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [owaLessons, setOwaLessons] = useState<OakOpenApiSearchSchema | []>();
  const { data } = trpc.additionalMaterials.searchOWALesson.useQuery(
    { query: searchText },
    { enabled: !!searchText }, // Run query only when searchText is not empty
  );
  const lessonTitles = getLessonTitle(lessons);

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
            lessonTitle,
            hasThreeCycles,
            keyStage,
            subject,
            sessionId,
          }: {
            lessonTitle: string;
            hasThreeCycles: boolean;
            keyStage: string;
            subject: string;
            sessionId: string;
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
