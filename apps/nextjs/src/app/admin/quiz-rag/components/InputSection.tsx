"use client";

import { useEffect, useRef, useState } from "react";

import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import type { PartialLessonPlan } from "@oakai/aila/src/protocol/schema";

import { trpc } from "@/utils/trpc";

import type { QuizRagDebugStoreApi } from "../store";
import { useQuizRagDebugStore } from "../store";

type InputMethod = "chatId" | "example" | "viewReport";

interface InputSectionProps {
  store: QuizRagDebugStoreApi;
  initialChatId?: string;
}

export function InputSection({ store, initialChatId }: InputSectionProps) {
  // Store state
  const selectedPlan = useQuizRagDebugStore(store, (s) => s.lessonPlan);
  const quizType = useQuizRagDebugStore(store, (s) => s.quizType);
  const setLessonPlan = useQuizRagDebugStore(store, (s) => s.setLessonPlan);
  const setQuizType = useQuizRagDebugStore(store, (s) => s.setQuizType);
  const setRelevantLessons = useQuizRagDebugStore(
    store,
    (s) => s.setRelevantLessons,
  );
  const setLoadedReport = useQuizRagDebugStore(store, (s) => s.setLoadedReport);

  // Local UI state
  const [inputMethod, setInputMethod] = useState<InputMethod>(
    initialChatId ? "chatId" : "example",
  );
  const [chatId, setChatId] = useState(initialChatId ?? "");
  const [selectedExample, setSelectedExample] = useState("");
  const [reportJson, setReportJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const hasTriggeredInitialLookup = useRef(false);

  const examples = trpc.quizRagDebug.getExampleLessonPlans.useQuery();
  const chatLookup = trpc.quizRagDebug.getLessonPlanByChatId.useQuery(
    { chatId },
    { enabled: false },
  );

  // Auto-trigger lookup when initialChatId is provided
  useEffect(() => {
    if (initialChatId && !hasTriggeredInitialLookup.current) {
      hasTriggeredInitialLookup.current = true;
      void chatLookup.refetch().then((result) => {
        if (result.data) {
          setLessonPlan(result.data.lessonPlan);
          setRelevantLessons(result.data.relevantLessons);
        }
      });
    }
  }, [initialChatId, chatLookup, setLessonPlan, setRelevantLessons]);

  const handleChatIdSubmit = async () => {
    if (chatId.length < 10) return;
    const result = await chatLookup.refetch();
    if (result.data) {
      setLessonPlan(result.data.lessonPlan);
      setRelevantLessons(result.data.relevantLessons);
      setIsEditing(false);
    }
  };

  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    const example = examples.data?.find((ex) => ex.id === exampleId);
    if (example) {
      const plan = example.plan as unknown as PartialLessonPlan;
      setLessonPlan(plan);
      setRelevantLessons([]);
      setIsEditing(false);
    }
  };

  const handleInputMethodChange = (method: InputMethod) => {
    if (method !== inputMethod) {
      setInputMethod(method);
      setLessonPlan(null);
      setSelectedExample("");
      setChatId("");
    }
  };

  const handleReportParse = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(reportJson) as ReportNode;
      setLoadedReport(parsed);
    } catch (e) {
      setParseError("Invalid JSON: " + (e as Error).message);
    }
  };

  // Collapsed view when plan is selected and not editing
  if (selectedPlan && !isEditing) {
    const learningPoints =
      quizType === "/starterQuiz"
        ? selectedPlan.priorKnowledge
        : selectedPlan.keyLearningPoints;

    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3">
              <p className="font-medium">{selectedPlan.title}</p>
              <p className="text-sm text-gray-500">
                {selectedPlan.subject} • {selectedPlan.keyStage} •{" "}
                {quizType === "/starterQuiz" ? "Starter Quiz" : "Exit Quiz"}
              </p>
            </div>
            {learningPoints && learningPoints.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">
                  {quizType === "/starterQuiz"
                    ? "Prior Knowledge:"
                    : "Key Learning Points:"}
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-600">
                  {learningPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedPlan.basedOn && (
              <div className="border-amber-200 bg-amber-50 mt-3 rounded border px-3 py-2">
                <p className="text-amber-800 text-xs font-medium">Based On:</p>
                <p className="text-amber-900 text-sm">
                  {selectedPlan.basedOn.title}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="space-y-6">
        {/* Quiz type selection - first */}
        {inputMethod !== "viewReport" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Quiz type:</span>
            <div className="flex gap-1 rounded-md bg-gray-100 p-0.5">
              <button
                onClick={() => setQuizType("/starterQuiz")}
                className={`rounded px-3 py-1.5 text-sm transition-all ${
                  quizType === "/starterQuiz"
                    ? "bg-white font-medium text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Starter
              </button>
              <button
                onClick={() => setQuizType("/exitQuiz")}
                className={`rounded px-3 py-1.5 text-sm transition-all ${
                  quizType === "/exitQuiz"
                    ? "bg-white font-medium text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Input method selection */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["chatId", "example", "viewReport"] as InputMethod[]).map(
            (method) => (
              <button
                key={method}
                onClick={() => handleInputMethodChange(method)}
                className={`flex-1 rounded-md px-3 py-2 text-sm transition-all ${
                  inputMethod === method
                    ? "bg-white font-medium text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {method === "chatId" && "From Chat ID"}
                {method === "example" && "Example"}
                {method === "viewReport" && "View Report"}
              </button>
            ),
          )}
        </div>

        {/* Input content */}
        {inputMethod === "chatId" && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter chat ID..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-gray-400 focus:outline-none"
              />
              <button
                onClick={() => void handleChatIdSubmit()}
                disabled={chatId.length < 10 || chatLookup.isFetching}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {chatLookup.isFetching ? "Loading..." : "Load"}
              </button>
            </div>
            {chatLookup.data && (
              <p className="text-sm text-green-600">
                Loaded: {chatLookup.data.lessonPlan.title}
              </p>
            )}
            {chatLookup.error && (
              <p className="text-sm text-red-600">{chatLookup.error.message}</p>
            )}
          </>
        )}

        {inputMethod === "example" && (
          <div>
            <p className="mb-4 text-sm text-gray-500">Choose an example:</p>
            <div className="flex flex-col gap-4">
              {examples.data?.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleExampleChange(ex.id)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-all ${
                    selectedExample === ex.id
                      ? "border-gray-900 bg-gray-50 font-medium"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {inputMethod === "viewReport" && (
          <>
            <textarea
              value={reportJson}
              onChange={(e) => setReportJson(e.target.value)}
              rows={6}
              placeholder="Paste report JSON..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-400 focus:outline-none"
            />
            <button
              onClick={handleReportParse}
              disabled={!reportJson.trim()}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Load Report
            </button>
            {parseError && <p className="text-sm text-red-600">{parseError}</p>}
          </>
        )}
      </div>
    </div>
  );
}
