"use client";

import { useState } from "react";

import type { QuizRagDebugResult } from "@oakai/aila/src/core/quiz/debug";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";
import { aiLogger } from "@oakai/logger";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import LoadingWheel from "@/components/LoadingWheel";
import { OakMathJaxContext } from "@/components/MathJax";
import { trpc } from "@/utils/trpc";

import { InputSection } from "./components/InputSection";
import { QuizRagDebugView } from "./view";

const log = aiLogger("admin");

export default function QuizRagDebugPage() {
  const user = useUser();
  const [lessonPlan, setLessonPlan] = useState<PartialLessonPlan | null>(null);
  const [quizType, setQuizType] = useState<QuizPath>("/starterQuiz");
  const [relevantLessons, setRelevantLessons] = useState<
    AilaRagRelevantLesson[]
  >([]);

  const runPipeline = trpc.quizRagDebug.runDebugPipeline.useMutation({
    onError: (error) => {
      log.error("Pipeline error:", error);
    },
  });

  if (user.isLoaded && !user.isSignedIn) {
    redirect("/sign-in?next=/admin/quiz-rag");
  }

  const handleRunPipeline = () => {
    if (!lessonPlan) return;
    // Transform null to undefined for fields that need it
    const cleanedPlan = {
      ...lessonPlan,
      topic: lessonPlan.topic ?? undefined,
    };
    runPipeline.mutate({
      lessonPlan: cleanedPlan,
      quizType,
      relevantLessons,
    });
  };

  return (
    <OakMathJaxContext>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Quiz RAG Debug Tool</h1>
          <p className="mt-2 text-gray-600">
            Run and inspect the Quiz RAG pipeline with full visibility into each
            stage.
          </p>
        </div>

        <InputSection
          onLessonPlanChange={setLessonPlan}
          onQuizTypeChange={setQuizType}
          onRelevantLessonsChange={setRelevantLessons}
        />

        {/* Action Panel */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
          {!lessonPlan ? (
            <p className="text-center text-gray-500">
              Select an example or enter a lesson plan above to get started
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Lesson plan loaded:</p>
                <p className="text-lg font-medium">
                  {lessonPlan.title || "Untitled lesson"}
                </p>
                {lessonPlan.subject && lessonPlan.keyStage && (
                  <p className="text-sm text-gray-500">
                    {lessonPlan.subject} • {lessonPlan.keyStage}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRunPipeline}
                  disabled={runPipeline.isLoading}
                  className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
                >
                  {runPipeline.isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Running
                      Pipeline...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ▶ Run Pipeline
                    </span>
                  )}
                </button>
                {runPipeline.data && (
                  <button
                    onClick={() => runPipeline.reset()}
                    className="rounded-lg bg-gray-200 px-4 py-3 hover:bg-gray-300"
                  >
                    Clear Results
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Click to run the{" "}
                {quizType === "/starterQuiz" ? "starter" : "exit"} quiz
                generation pipeline
              </p>
            </div>
          )}
        </div>

        {runPipeline.isLoading && (
          <div className="flex items-center gap-4">
            <LoadingWheel />
            <span>
              Running quiz RAG pipeline... This may take 30-60 seconds.
            </span>
          </div>
        )}

        {runPipeline.error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            Error: {runPipeline.error.message}
          </div>
        )}

        {runPipeline.data && (
          <QuizRagDebugView result={runPipeline.data as QuizRagDebugResult} />
        )}
      </div>
    </OakMathJaxContext>
  );
}
