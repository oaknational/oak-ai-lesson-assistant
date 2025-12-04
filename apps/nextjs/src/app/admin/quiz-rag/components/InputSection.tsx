"use client";

import { useEffect, useState } from "react";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "@oakai/aila/src/protocol/schema";

import { trpc } from "@/utils/trpc";

type InputMethod = "chatId" | "example" | "json";

interface InputSectionProps {
  onLessonPlanChange: (plan: PartialLessonPlan | null) => void;
  onQuizTypeChange: (type: QuizPath) => void;
  onRelevantLessonsChange: (lessons: AilaRagRelevantLesson[]) => void;
  selectedPlan: PartialLessonPlan | null;
  quizType: QuizPath;
}

export function InputSection({
  onLessonPlanChange,
  onQuizTypeChange,
  onRelevantLessonsChange,
  selectedPlan,
  quizType,
}: InputSectionProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>("example");
  const [chatId, setChatId] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedExample, setSelectedExample] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(!selectedPlan);

  useEffect(() => {
    if (selectedPlan) {
      setIsExpanded(false);
    }
  }, [selectedPlan]);

  const examples = trpc.quizRagDebug.getExampleLessonPlans.useQuery();
  const chatLookup = trpc.quizRagDebug.getLessonPlanByChatId.useQuery(
    { chatId },
    { enabled: false },
  );

  const handleChatIdSubmit = async () => {
    if (chatId.length < 10) return;
    const result = await chatLookup.refetch();
    if (result.data) {
      onLessonPlanChange(result.data.lessonPlan);
      onRelevantLessonsChange(result.data.relevantLessons);
      setIsExpanded(false);
    }
  };

  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    const example = examples.data?.find((ex) => ex.id === exampleId);
    if (example) {
      const plan = example.plan as unknown as PartialLessonPlan;
      onLessonPlanChange(plan);
      onRelevantLessonsChange([]);
      setIsExpanded(false);
    }
  };

  const handleJsonParse = () => {
    setParseError(null);
    try {
      const parsed = JSON.parse(jsonInput) as PartialLessonPlan;
      onLessonPlanChange(parsed);
      onRelevantLessonsChange([]);
      setIsExpanded(false);
    } catch (e) {
      setParseError("Invalid JSON: " + (e as Error).message);
    }
  };

  const handleClear = () => {
    onLessonPlanChange(null);
    setSelectedExample("");
    setChatId("");
    setJsonInput("");
    setIsExpanded(true);
  };

  // Collapsed view when plan is selected
  if (selectedPlan && !isExpanded) {
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
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={handleClear}
              className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-6">
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
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Enter chat/lesson plan ID..."
              className="flex-1 rounded border px-3 py-2"
            />
            <button
              onClick={() => void handleChatIdSubmit()}
              disabled={chatId.length < 10 || chatLookup.isFetching}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
            >
              {chatLookup.isFetching ? "Loading..." : "Look up"}
            </button>
          </div>
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
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="/starterQuiz"
              checked={quizType === "/starterQuiz"}
              onChange={() => onQuizTypeChange("/starterQuiz")}
            />
            Starter Quiz (Prior Knowledge)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="/exitQuiz"
              checked={quizType === "/exitQuiz"}
              onChange={() => onQuizTypeChange("/exitQuiz")}
            />
            Exit Quiz (Key Learning Points)
          </label>
        </div>
      </div>
    </div>
  );
}
