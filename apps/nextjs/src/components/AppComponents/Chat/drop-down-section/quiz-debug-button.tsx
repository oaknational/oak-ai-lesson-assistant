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
  const chatId = useLessonPlanStore((state) => state.id);
  const subject = useLessonPlanStore((state) => state.lessonPlan.subject);

  const isAdmin =
    isLoaded &&
    user?.emailAddresses.some((email) =>
      email.emailAddress.endsWith("@thenational.academy"),
    );

  if (!isAdmin) return null;
  if (subject !== "maths") return null;

  const label =
    quizType === "/starterQuiz"
      ? "Generate Starter Quiz"
      : "Generate Exit Quiz";

  return (
    <Link href={`/admin/quiz-playground?chatId=${chatId}&quizType=${quizType}`}>
      <ActionButton
        onClick={() => {}}
        tooltip="Open Quiz Generation Playground with this lesson plan"
      >
        {label}
      </ActionButton>
    </Link>
  );
}
