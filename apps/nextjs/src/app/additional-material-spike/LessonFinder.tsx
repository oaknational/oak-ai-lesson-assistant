"use client";

import { useEffect, useState } from "react";

import type { OakOpenApiSearchSchema } from "@oakai/additional-materials/src/schemas";

import { OakFlex, OakHeading, OakTextInput } from "@oaknational/oak-components";
import Link from "next/link";
import { redirect } from "next/navigation";

import { useClientSideFeatureFlag } from "@/components/ContextProviders/FeatureFlagProvider";
import { trpc } from "@/utils/trpc";

type AilALessonTitles = {
  sessionId: string;
  lessonTitle: string;
  keyStage: string;
  subject: string;
  hasThreeCycles: boolean;
}[];

const LessonFinder = ({ lessons }: { lessons: AilALessonTitles }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [owaLessons, setOwaLessons] = useState<OakOpenApiSearchSchema | []>();
  const { data: owaData } = trpc.additionalMaterials.searchOWALesson.useQuery(
    { query: searchText },
    { enabled: !!searchText },
  );
  const canSeeSpike = useClientSideFeatureFlag("additional-materials");

  if (!canSeeSpike) {
    redirect("/");
  }

  useEffect(() => {
    if (owaData && owaData !== owaLessons) {
      setOwaLessons(owaData);
    }
  }, [owaData, owaLessons]);

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
        {lessons.map(
          ({ lessonTitle, hasThreeCycles, keyStage, subject, sessionId }) => {
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
