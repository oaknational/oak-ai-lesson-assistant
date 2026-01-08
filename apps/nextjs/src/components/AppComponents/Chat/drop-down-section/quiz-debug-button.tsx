"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

import { useLessonPlanStore } from "@/stores/AilaStoresProvider";

import ActionButton from "./action-button";

interface QuizDebugButtonProps {
  quizType: "/starterQuiz" | "/exitQuiz";
}

export function QuizDebugButton({ quizType }: Readonly<QuizDebugButtonProps>) {
  const { user, isLoaded } = useUser();
  const subject = useLessonPlanStore((state) => state.lessonPlan.subject);
  const quiz = useLessonPlanStore((state) =>
    quizType === "/starterQuiz"
      ? state.lessonPlan.starterQuiz
      : state.lessonPlan.exitQuiz,
  );

  const isAdmin =
    isLoaded &&
    user?.emailAddresses.some((email) =>
      email.emailAddress.endsWith("@thenational.academy"),
    );

  if (!isAdmin) return null;
  if (subject !== "maths") return null;

  const reportId = quiz?.reportId;
  if (!reportId) return null;

  return (
    <Link href={`/admin/quiz-playground?reportId=${reportId}`}>
      <ActionButton
        onClick={() => {}}
        tooltip="View the generation report for this quiz"
      >
        Open in Playground
      </ActionButton>
    </Link>
  );
}
