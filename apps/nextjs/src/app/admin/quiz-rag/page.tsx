"use client";

import { useMemo } from "react";

import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import type { QuizPath } from "@oakai/aila/src/protocol/schema";

import { useUser } from "@clerk/nextjs";
import { redirect, useSearchParams } from "next/navigation";

import { OakMathJaxContext } from "@/components/MathJax";

import { InputSection } from "./components/InputSection";
import { createQuizRagDebugStore, useQuizRagDebugStore } from "./store";
import { QuizRagDebugView } from "./view";

export type { ViewMode } from "./store";

export default function QuizRagDebugPage() {
  const user = useUser();
  const searchParams = useSearchParams();
  const urlChatId = searchParams.get("chatId");
  const urlQuizType = searchParams.get("quizType") as QuizPath | null;

  const initialQuizType =
    urlQuizType === "/starterQuiz" || urlQuizType === "/exitQuiz"
      ? urlQuizType
      : "/starterQuiz";

  // Create store instance for this page
  const store = useMemo(
    () => createQuizRagDebugStore(initialQuizType),
    [initialQuizType],
  );

  // Select state from store
  const lessonPlan = useQuizRagDebugStore(store, (s) => s.lessonPlan);
  const viewMode = useQuizRagDebugStore(store, (s) => s.viewMode);
  const loadedReport = useQuizRagDebugStore(store, (s) => s.loadedReport);
  const isRunning = useQuizRagDebugStore(store, (s) => s.isRunning);
  const error = useQuizRagDebugStore(store, (s) => s.error);
  const streamingReport = useQuizRagDebugStore(store, (s) => s.streamingReport);

  // Select actions from store
  const setViewMode = useQuizRagDebugStore(store, (s) => s.setViewMode);
  const setLoadedReport = useQuizRagDebugStore(store, (s) => s.setLoadedReport);
  const runPipeline = useQuizRagDebugStore(store, (s) => s.runPipeline);
  const resetPipeline = useQuizRagDebugStore(store, (s) => s.resetPipeline);

  const activeReport = loadedReport ?? streamingReport;

  if (user.isLoaded && !user.isSignedIn) {
    redirect("/sign-in?next=/admin/quiz-rag");
  }

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
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Generate a Quiz
          </h2>
          <InputSection store={store} initialChatId={urlChatId ?? undefined} />
        </div>

        <div className="h-8" />

        {/* Action Panel */}
        <div className="flex items-center justify-center gap-4">
          {loadedReport ? (
            <button
              onClick={() => setLoadedReport(null)}
              className="rounded-lg bg-gray-200 px-8 py-3 text-lg font-semibold hover:bg-gray-300"
            >
              Clear Loaded Report
            </button>
          ) : (
            <>
              <button
                onClick={() => void runPipeline()}
                disabled={isRunning || !lessonPlan}
                className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span> Running Pipeline...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ▶ Run Pipeline
                  </span>
                )}
              </button>
              {(streamingReport || isRunning) && (
                <button
                  onClick={resetPipeline}
                  className="rounded-lg bg-gray-200 px-4 py-3 hover:bg-gray-300"
                >
                  {isRunning ? "Cancel" : "Clear Results"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Streaming Progress - detailed pipeline status */}
        {isRunning && streamingReport && (
          <StreamingProgressPanel report={streamingReport} />
        )}

        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            Error: {error.message}
          </div>
        )}

        {/* Show view with streaming data during pipeline run, or final report */}
        {activeReport && (
          <QuizRagDebugView
            viewMode={viewMode}
            report={activeReport}
            isStreaming={!loadedReport && isRunning}
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
}: Readonly<{
  status: NodeStatus;
  small?: boolean;
}>) {
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
