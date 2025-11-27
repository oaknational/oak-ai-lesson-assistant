"use client";

import { useState } from "react";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";

import { trpc } from "@/utils/trpc";

type InputMethod = "chatId" | "example" | "json";

interface InputSectionProps {
  onLessonPlanChange: (plan: PartialLessonPlan) => void;
  onQuizTypeChange: (type: QuizPath) => void;
  onRelevantLessonsChange: (lessons: AilaRagRelevantLesson[]) => void;
}

export function InputSection({
  onLessonPlanChange,
  onQuizTypeChange,
  onRelevantLessonsChange,
}: InputSectionProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>("example");
  const [chatId, setChatId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [quizType, setQuizType] = useState<QuizPath>("/starterQuiz");
  const [parseError, setParseError] = useState<string | null>(null);
  const [chatLookupEnabled, setChatLookupEnabled] = useState(false);

  const examples = trpc.quizRagDebug.getExampleLessonPlans.useQuery();
  const chatLookup = trpc.quizRagDebug.getLessonPlanByChatId.useQuery(
    { chatId },
    { enabled: chatLookupEnabled && chatId.length > 10 },
  );

  const handleChatIdSubmit = () => {
    if (chatId.length > 10) {
      setChatLookupEnabled(true);
    }
  };

  // When chat data is loaded, apply it
  if (chatLookup.data && chatLookupEnabled) {
    onLessonPlanChange(chatLookup.data.lessonPlan);
    onRelevantLessonsChange(chatLookup.data.relevantLessons);
    setChatLookupEnabled(false);
  }

  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    const example = examples.data?.find((ex) => ex.id === exampleId);
    if (example) {
      // Cast to PartialLessonPlan - example plans are typed in the router
      const plan = example.plan as unknown as PartialLessonPlan;
      onLessonPlanChange(plan);
      onRelevantLessonsChange([]);
    }
  };

  const handleJsonParse = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(jsonInput) as PartialLessonPlan;
      onLessonPlanChange(parsed);
      onRelevantLessonsChange([]);
    } catch (e) {
      setParseError("Invalid JSON: " + (e as Error).message);
    }
  };

  const handleQuizTypeChange = (type: QuizPath) => {
    setQuizType(type);
    onQuizTypeChange(type);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b pb-2">
        {(["chatId", "example", "json"] as InputMethod[]).map((method) => (
          <button
            key={method}
            onClick={() => setInputMethod(method)}
            className={`rounded-t px-4 py-2 ${
              inputMethod === method
                ? "border-blue-600 bg-blue-50 border-b-2 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {method === "chatId" && "Chat ID"}
            {method === "example" && "Examples"}
            {method === "json" && "Paste JSON"}
          </button>
        ))}
      </div>

      {/* Input content based on selected method */}
      {inputMethod === "chatId" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Chat ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value);
                setChatLookupEnabled(false);
              }}
              placeholder="Enter chat/lesson plan ID..."
              className="flex-1 rounded border px-3 py-2"
            />
            <button
              onClick={handleChatIdSubmit}
              disabled={chatId.length < 10}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
            >
              Look up
            </button>
          </div>
          {chatLookup.isLoading && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
          {chatLookup.data && (
            <p className="text-sm text-green-600">
              Found: {chatLookup.data.title} ({chatLookup.data.lessonPlan.title}
              )
            </p>
          )}
          {chatLookup.error && (
            <p className="text-sm text-red-600">
              Error: {chatLookup.error.message}
            </p>
          )}
        </div>
      )}

      {inputMethod === "example" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Example Lesson Plan
          </label>
          <select
            value={selectedExample}
            onChange={(e) => handleExampleChange(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select an example...</option>
            {examples.data?.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.label}
              </option>
            ))}
          </select>
          {selectedExample && (
            <p className="text-sm text-green-600">Example loaded</p>
          )}
        </div>
      )}

      {inputMethod === "json" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Lesson Plan JSON</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            placeholder="Paste lesson plan JSON..."
            className="w-full rounded border px-3 py-2 font-mono text-sm"
          />
          <button
            onClick={handleJsonParse}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Parse JSON
          </button>
          {parseError && <p className="text-sm text-red-600">{parseError}</p>}
        </div>
      )}

      {/* Quiz type selection */}
      <div className="border-t pt-4">
        <label className="mb-2 block text-sm font-medium">Quiz Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="/starterQuiz"
              checked={quizType === "/starterQuiz"}
              onChange={() => handleQuizTypeChange("/starterQuiz")}
            />
            Starter Quiz (Prior Knowledge)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="/exitQuiz"
              checked={quizType === "/exitQuiz"}
              onChange={() => handleQuizTypeChange("/exitQuiz")}
            />
            Exit Quiz (Key Learning Points)
          </label>
        </div>
      </div>
    </div>
  );
}
