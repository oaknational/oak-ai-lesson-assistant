"use client";

import { useEffect, useState } from "react";

import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { OakMathJaxContext } from "@/components/MathJax";

import { InputSection } from "./components/InputSection";
import { type QuizDebugResult, useStreamingDebug } from "./useStreamingDebug";
import { QuizRagDebugView } from "./view";

const STORAGE_KEY = "quiz-rag-debug-result";

// Persist results to localStorage for hot-reload survival
function usePersistedResult() {
  const [persistedResult, setPersistedResult] =
    useState<QuizDebugResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPersistedResult(JSON.parse(stored) as QuizDebugResult);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveResult = (result: QuizDebugResult) => {
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
            <h1 className="text-3xl font-bold">Quiz RAG Debug Tool</h1>
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

        {/* Pipeline Overview (Learn mode only) */}
        {viewMode === "learn" && (
          <div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Pipeline Overview
            </h2>
            <p className="mb-6 max-w-3xl text-base leading-relaxed text-gray-600">
              The Quiz RAG pipeline generates quiz questions by retrieving
              relevant questions from Oak&apos;s question bank and selecting the
              best matches for the lesson plan.
            </p>

            {/* Visual Pipeline Diagram - Vertical */}
            <div className="mx-auto max-w-2xl">
              <div className="flex items-center gap-12">
                <div className="w-32 shrink-0 rounded-lg bg-mint px-3 py-5 text-center font-medium">
                  Generators
                </div>
                <p className="text-sm text-gray-500">
                  Retrieve candidate questions from multiple sources (BasedOn,
                  AilaRag, ML Multi-Term)
                </p>
              </div>
              <div className="w-32 text-center text-gray-400">↓</div>
              <div className="flex items-center gap-12">
                <div className="w-32 shrink-0 rounded-lg bg-lemon px-3 py-5 text-center font-medium">
                  Images
                </div>
                <p className="text-sm text-gray-500">
                  Generate text descriptions of images using GPT-4o vision
                </p>
              </div>
              <div className="w-32 text-center text-gray-400">↓</div>
              <div className="flex items-center gap-12">
                <div className="w-32 shrink-0 rounded-lg bg-lavender px-3 py-5 text-center font-medium">
                  Composer
                </div>
                <p className="text-sm text-gray-500">
                  Select the 6 best questions based on learning objectives
                </p>
              </div>
              <div className="w-32 text-center text-gray-400">↓</div>
              <div className="flex items-center gap-12">
                <div className="w-32 shrink-0 rounded-lg bg-pink px-3 py-5 text-center font-medium">
                  Final Quiz
                </div>
                <p className="text-sm text-gray-500">
                  The selected questions in order, ready for the lesson plan
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />

        <div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Lesson Input
          </h2>
          <InputSection
            onLessonPlanChange={setLessonPlan}
            onQuizTypeChange={setQuizType}
            onRelevantLessonsChange={setRelevantLessons}
            selectedPlan={lessonPlan}
            quizType={quizType}
          />
        </div>

        <div className="h-8" />

        {/* Action Panel */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleRunPipeline}
            disabled={isRunning || !lessonPlan}
            className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span> Running Pipeline...
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

        {/* Show view with streaming data during pipeline run, or final result */}
        {(result || (isRunning && streaming.report)) && (
          <QuizRagDebugView
            result={result}
            viewMode={viewMode}
            report={streaming.report ?? result?.report ?? null}
            isStreaming={isRunning}
          />
        )}
      </div>
    </OakMathJaxContext>
  );
}

// Streaming Progress Panel - Visual pipeline progress during streaming
function StreamingProgressPanel({ report }: { report: ReportNode }) {
  type StageConfig = {
    path: string[];
    label: string;
    color: "mint" | "lemon" | "lavender" | "pink";
    description: string;
  };

  const stageConfig: StageConfig[] = [
    {
      path: ["basedOnRag"],
      label: "BasedOnRag",
      color: "mint",
      description: "Questions from basedOn lesson",
    },
    {
      path: ["ailaRag"],
      label: "AilaRag",
      color: "mint",
      description: "Questions from relevant lessons",
    },
    {
      path: ["mlMultiTerm"],
      label: "ML Multi-Term",
      color: "mint",
      description: "Semantic search + Cohere rerank",
    },
    {
      path: ["selector", "imageDescriptions"],
      label: "Images",
      color: "lemon",
      description: "GPT-4o image descriptions",
    },
    {
      path: ["selector", "composerPrompt"],
      label: "Prompt",
      color: "lavender",
      description: "Build composition prompt",
    },
    {
      path: ["selector", "composerLlm"],
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

  // Get node by path
  const getNode = (path: string[]): ReportNode | undefined => {
    let node: ReportNode | undefined = report;
    for (const segment of path) {
      node = node?.children[segment];
    }
    return node;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="animate-spin">⚙️</span>
        <h3 className="text-lg font-semibold">Running Pipeline...</h3>
      </div>

      <div className="flex gap-2">
        {stageConfig.map(({ path, label, color, description }) => {
          const node = getNode(path);
          const status = node?.status ?? "pending";
          const isActive = status === "running";
          const isComplete = status === "complete";

          return (
            <div
              key={path.join(".")}
              className={`flex-1 rounded-xl border-2 p-3 transition-all ${
                isActive
                  ? `${colorClasses[color]} shadow-md`
                  : isComplete
                    ? `${colorClasses[color]} opacity-90`
                    : "border-gray-200 bg-gray-50 opacity-50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <StageStatusIcon status={status} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <p className="text-xs text-gray-600">{description}</p>
              {status === "complete" && node?.durationMs && (
                <p className="mt-1 text-xs text-gray-500">
                  {(node.durationMs / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type NodeStatus = ReportNode["status"];

function StageStatusIcon({
  status,
  small = false,
}: {
  status: NodeStatus;
  small?: boolean;
}) {
  const size = small ? "text-xs" : "text-sm";

  switch (status) {
    case "pending":
      return <span className={`${size} text-gray-400`}>⏳</span>;
    case "running":
      return <span className={`${size} animate-spin`}>⚙️</span>;
    case "complete":
      return <span className={`${size} text-green-600`}>✓</span>;
    case "error":
      return <span className={`${size} text-red-600`}>✗</span>;
  }
}
