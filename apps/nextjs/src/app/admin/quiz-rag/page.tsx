"use client";

import { useEffect, useState } from "react";

import type {
  QuizRagDebugResult,
  QuizRagStreamingReport,
  StreamingStageStatus,
} from "@oakai/aila/src/core/quiz/debug";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { OakMathJaxContext } from "@/components/MathJax";

import { InputSection } from "./components/InputSection";
import { useStreamingDebug } from "./useStreamingDebug";
import { QuizRagDebugView } from "./view";

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
  const streaming = useStreamingDebug();

  // Sync lesson plan and quiz type from persisted result on load
  useEffect(() => {
    if (persistedResult && !lessonPlan) {
      setLessonPlan(persistedResult.input.lessonPlan);
      setQuizType(persistedResult.input.quizType);
      setRelevantLessons(persistedResult.input.relevantLessons);
    }
  }, [persistedResult, lessonPlan]);

  // Save result when complete
  useEffect(() => {
    if (streaming.result) {
      saveResult(streaming.result);
    }
  }, [streaming.result, saveResult]);

  const isRunning = streaming.isRunning;
  const error = streaming.error;
  const result = streaming.result ?? persistedResult;

  if (user.isLoaded && !user.isSignedIn) {
    redirect("/sign-in?next=/admin/quiz-rag");
  }

  const handleRunPipeline = () => {
    if (!lessonPlan) return;
    const cleanedPlan = {
      ...lessonPlan,
      topic: lessonPlan.topic ?? undefined,
    };
    void streaming.runPipeline(cleanedPlan, quizType, relevantLessons);
  };

  const handleClear = () => {
    streaming.reset();
    clearResult();
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
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRunPipeline}
            disabled={isRunning || !lessonPlan}
            className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Running Pipeline...
              </span>
            ) : (
              <span className="flex items-center gap-2">▶ Run Pipeline</span>
            )}
          </button>
          {(result || isRunning) && (
            <button
              onClick={handleClear}
              className="rounded-lg bg-gray-200 px-4 py-3 hover:bg-gray-300"
            >
              {isRunning ? "Cancel" : "Clear Results"}
            </button>
          )}
        </div>

        {/* Streaming Progress - detailed pipeline status */}
        {isRunning && streaming.report && (
          <StreamingProgressPanel report={streaming.report} />
        )}

        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            Error: {error.message}
          </div>
        )}

        {/* Sticky Lesson Context Bar */}
        {result?.input && (
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
                  <p className="font-semibold">
                    {result.input.lessonPlan.title}
                  </p>
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

        {/* Show view with streaming data during pipeline run, or final result */}
        {(result?.input || (isRunning && lessonPlan)) && (
          <QuizRagDebugView
            result={
              result ?? {
                // Partial result for streaming - will be populated progressively
                input: {
                  lessonPlan: lessonPlan!,
                  quizType,
                  relevantLessons,
                },
                generators: {},
                reranker: { type: "no-op", ratings: [] },
                selector:
                  undefined as unknown as QuizRagDebugResult["selector"],
                finalQuiz:
                  undefined as unknown as QuizRagDebugResult["finalQuiz"],
                timing: {
                  totalMs: 0,
                  generatorsMs: 0,
                  rerankerMs: 0,
                  selectorMs: 0,
                },
              }
            }
            viewMode={viewMode}
            streamingReport={streaming.report}
            isStreaming={isRunning}
          />
        )}
      </div>
    </OakMathJaxContext>
  );
}

// Streaming Progress Panel - Visual pipeline progress during streaming
function StreamingProgressPanel({
  report,
}: {
  report: QuizRagStreamingReport;
}) {
  type StageConfig = {
    key: keyof QuizRagStreamingReport["stages"];
    label: string;
    color: "mint" | "lemon" | "lavender" | "pink";
    description: string;
  };

  const stageConfig: StageConfig[] = [
    {
      key: "basedOnRag",
      label: "BasedOnRag",
      color: "mint",
      description: "Questions from basedOn lesson",
    },
    {
      key: "ailaRag",
      label: "AilaRag",
      color: "mint",
      description: "Questions from relevant lessons",
    },
    {
      key: "mlMultiTerm",
      label: "ML Multi-Term",
      color: "mint",
      description: "Semantic search + Cohere rerank",
    },
    {
      key: "imageDescriptions",
      label: "Images",
      color: "lemon",
      description: "GPT-4o image descriptions",
    },
    {
      key: "composerPrompt",
      label: "Prompt",
      color: "lavender",
      description: "Build composition prompt",
    },
    {
      key: "composerLlm",
      label: "LLM",
      color: "lavender",
      description: "o4-mini quiz composition",
    },
  ];

  const colorClasses = {
    mint: "border-mint bg-mint30",
    lemon: "border-lemon bg-lemon30",
    lavender: "border-lavender bg-lavender30",
    pink: "border-pink bg-pink30",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span>⏳</span>
        <h3 className="text-lg font-semibold">Running Pipeline...</h3>
      </div>

      <div className="flex gap-2">
        {stageConfig.map(({ key, label, color, description }) => {
          const stage = report.stages[key];
          const isActive = stage.status === "running";
          const isComplete = stage.status === "complete";

          return (
            <div
              key={key}
              className={`flex-1 rounded-xl border-2 p-3 transition-all ${
                isActive
                  ? `${colorClasses[color]} shadow-md`
                  : isComplete
                    ? `${colorClasses[color]} opacity-90`
                    : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <StageStatusIcon status={stage.status} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <p className="text-xs text-gray-600">{description}</p>
              {stage.status === "complete" && stage.durationMs && (
                <p className="mt-1 text-xs text-gray-500">
                  {(stage.durationMs / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageStatusIcon({
  status,
  small = false,
}: {
  status: StreamingStageStatus;
  small?: boolean;
}) {
  const size = small ? "text-xs" : "text-sm";

  switch (status) {
    case "pending":
      return <span className={`${size} text-gray-400`}>○</span>;
    case "running":
      return <span className={size}>⏳</span>;
    case "complete":
      return <span className={`${size} text-green-600`}>✓</span>;
    case "error":
      return <span className={`${size} text-red-600`}>✗</span>;
  }
}
