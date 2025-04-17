"use client";

import LessonOverviewQuizContainer from "@/components/AppComponents/Chat/Quiz/LessonOverviewQuizContainer";
import { fixtures } from "@/components/AppComponents/Chat/Quiz/fixtures";

export default function TestQuizPage() {
  return (
    <LessonOverviewQuizContainer
      questions={fixtures}
      imageAttribution={[]}
      isMathJaxLesson={true}
    />
  );
}
