"use client";

import { useEffect, useState } from "react";

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

const STORAGE_KEY = "quiz-rag-debug-result";

// Persist results to localStorage for hot-reload survival
function usePersistedResult() {
  const [persistedResult, setPersistedResult] =
    useState<QuizRagDebugResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPersistedResult(JSON.parse(stored) as QuizRagDebugResult);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveResult = (result: QuizRagDebugResult) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    setPersistedResult(result);
  };

  const clearResult = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPersistedResult(null);
  };

  return { persistedResult, saveResult, clearResult };
}

export type ViewMode = "learn" | "eval";

export default function QuizRagDebugPage() {
  const user = useUser();
  const [lessonPlan, setLessonPlan] = useState<PartialLessonPlan | null>(null);
  const [quizType, setQuizType] = useState<QuizPath>("/starterQuiz");
  const [relevantLessons, setRelevantLessons] = useState<
    AilaRagRelevantLesson[]
  >([]);
  const [viewMode, setViewMode] = useState<ViewMode>("learn");

  const { persistedResult, saveResult, clearResult } = usePersistedResult();

  const runPipeline = trpc.quizRagDebug.runDebugPipeline.useMutation({
    onSuccess: (data) => {
      saveResult(data as QuizRagDebugResult);
    },
    onError: (error) => {
      log.error("Pipeline error:", error);
    },
  });

  const result = (runPipeline.data as QuizRagDebugResult) ?? persistedResult;

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quiz RAG Debug Tool</h1>
            <p className="mt-2 text-gray-600">
              Run and inspect the Quiz RAG pipeline with full visibility into
              each stage.
            </p>
          </div>
          <div className="inline-flex rounded-2xl bg-gray-200 p-2">
            <button
              onClick={() => setViewMode("learn")}
              className={`rounded-xl px-8 py-4 text-lg font-bold transition-all ${
                viewMode === "learn"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📚 Learn Mode
            </button>
            <button
              onClick={() => setViewMode("eval")}
              className={`rounded-xl px-8 py-4 text-lg font-bold transition-all ${
                viewMode === "eval"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🔬 Eval Mode
            </button>
          </div>
        </div>

        <InputSection
          onLessonPlanChange={setLessonPlan}
          onQuizTypeChange={setQuizType}
          onRelevantLessonsChange={setRelevantLessons}
          selectedPlan={lessonPlan}
          quizType={quizType}
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
                {result && (
                  <button
                    onClick={() => {
                      runPipeline.reset();
                      clearResult();
                    }}
                    className="rounded-lg bg-gray-200 px-4 py-3 hover:bg-gray-300"
                  >
                    Clear Results
                  </button>
                )}
              </div>
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

        {/* Sticky Lesson Context Bar */}
        {result && (
          <div className="sticky top-24 z-10 -mx-4 rounded-lg border bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-8">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">
                    {result.input.lessonPlan.subject} •{" "}
                    {result.input.lessonPlan.keyStage} •{" "}
                    {result.input.quizType === "/starterQuiz"
                      ? "Starter Quiz"
                      : "Exit Quiz"}
                  </p>
                  <p className="font-semibold">{result.input.lessonPlan.title}</p>
                </div>
              </div>
              <div className="max-w-2xl">
                {result.input.quizType === "/starterQuiz" &&
                  result.input.lessonPlan.priorKnowledge &&
                  result.input.lessonPlan.priorKnowledge.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Prior Knowledge:
                      </p>
                      <ul className="list-inside list-disc text-sm text-gray-700">
                        {result.input.lessonPlan.priorKnowledge.map((pk, i) => (
                          <li key={i}>{pk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {result.input.quizType === "/exitQuiz" &&
                  result.input.lessonPlan.keyLearningPoints &&
                  result.input.lessonPlan.keyLearningPoints.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Key Learning Points:
                      </p>
                      <ul className="list-inside list-disc text-sm text-gray-700">
                        {result.input.lessonPlan.keyLearningPoints.map(
                          (klp, i) => (
                            <li key={i}>{klp}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {result && <QuizRagDebugView result={result} viewMode={viewMode} />}
      </div>
    </OakMathJaxContext>
  );
}
