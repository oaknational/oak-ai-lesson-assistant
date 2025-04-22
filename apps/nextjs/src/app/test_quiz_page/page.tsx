"use client";

import { rawQuizFixture } from "@oakai/aila/src/protocol/rawQuizSchema";

import LessonOverviewQuizContainer from "@/components/AppComponents/Chat/Quiz/LessonOverviewQuizContainer";

export default function TestQuizPage() {
  return (
    <LessonOverviewQuizContainer
      questions={rawQuizFixture}
      imageAttribution={[]}
      isMathJaxLesson={true}
    />
  );
}
