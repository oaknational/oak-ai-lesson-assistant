"use client";

import { useState } from "react";

import type {
  GeneratorDebugResult,
  ImageDescriptionDebugResult,
  MLMultiTermDebugResult,
  QuizRagDebugResult,
} from "@oakai/aila/src/core/quiz/debug";
import type { RagQuizQuestion } from "@oakai/aila/src/core/quiz/interfaces";

import { MathJaxWrap } from "@/components/MathJax";

import { MLPipelineDetails } from "./components/MLPipelineDetails";
import { QuestionCard } from "./components/QuestionCard";

interface QuizRagDebugViewProps {
  result: QuizRagDebugResult;
}

export function QuizRagDebugView({ result }: QuizRagDebugViewProps) {
  return (
    <div className="space-y-8">
      {/* Timing Summary */}
      <TimingSummary timing={result.timing} />

      {/* Stage 1: Generators */}
      <Section title="Stage 1: Generators" defaultOpen>
        <div className="space-y-6">
          {result.generators.basedOnRag && (
            <GeneratorSection
              title="BasedOnRag Generator"
              result={result.generators.basedOnRag}
            />
          )}
          {result.generators.ailaRag && (
            <GeneratorSection
              title="AilaRag Generator"
              result={result.generators.ailaRag}
            />
          )}
          {result.generators.mlMultiTerm && (
            <MLPipelineDetails result={result.generators.mlMultiTerm} />
          )}
          {!result.generators.basedOnRag &&
            !result.generators.ailaRag &&
            !result.generators.mlMultiTerm && (
              <p className="text-gray-500">No generators produced results</p>
            )}
        </div>
      </Section>

      {/* Stage 2: Image Descriptions */}
      <Section title="Stage 2: Image Descriptions">
        <ImageDescriptionsView result={result.selector.imageDescriptions} />
      </Section>

      {/* Stage 3: LLM Composer */}
      <Section title="Stage 3: LLM Composer">
        <ComposerSection
          prompt={result.selector.composerPrompt}
          response={result.selector.composerResponse}
          selectedQuestions={result.selector.selectedQuestions}
        />
      </Section>

      {/* Final Quiz */}
      <Section title="Final Quiz" defaultOpen>
        <FinalQuizDisplay
          questions={result.selector.selectedQuestions}
          quiz={result.finalQuiz}
        />
      </Section>
    </div>
  );
}

// Timing Summary Component
function TimingSummary({ timing }: { timing: QuizRagDebugResult["timing"] }) {
  return (
    <div className="flex gap-4 rounded-lg bg-gray-100 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Total:</span>
        <span className="font-mono font-medium">{timing.totalMs}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Generators:</span>
        <span className="font-mono">{timing.generatorsMs}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Reranker:</span>
        <span className="font-mono">{timing.rerankerMs}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Selector:</span>
        <span className="font-mono">{timing.selectorMs}ms</span>
      </div>
    </div>
  );
}

// Collapsible Section Component
function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-gray-400">{isOpen ? "▼" : "▶"}</span>
      </button>
      {isOpen && <div className="border-t p-4">{children}</div>}
    </div>
  );
}

// Generator Section for basedOnRag and ailaRag
function GeneratorSection({
  title,
  result,
}: {
  title: string;
  result: GeneratorDebugResult;
}) {
  const totalQuestions = result.pools.reduce(
    (sum, p) => sum + p.questions.length,
    0,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-gray-500">
          {result.pools.length} pool(s), {totalQuestions} questions,{" "}
          {result.timingMs}ms
        </span>
      </div>
      {result.metadata?.sourceLesson && (
        <p className="text-sm text-gray-600">
          Source: {result.metadata.sourceLesson}
        </p>
      )}
      <div className="space-y-2">
        {result.pools.map((pool, idx) => (
          <div key={idx} className="rounded border bg-gray-50 p-3">
            <p className="mb-2 text-sm font-medium">
              Pool {idx + 1}:{" "}
              {pool.source.type === "basedOn" && pool.source.lessonTitle}
              {pool.source.type === "ailaRag" && pool.source.lessonTitle}
              {pool.source.type === "mlSemanticSearch" &&
                `"${pool.source.semanticQuery}"`}
            </p>
            <div className="space-y-2">
              {pool.questions.map((q) => (
                <QuestionCard key={q.sourceUid} question={q} compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Image Descriptions View
function ImageDescriptionsView({
  result,
}: {
  result: ImageDescriptionDebugResult;
}) {
  const [showAll, setShowAll] = useState(false);

  if (result.totalImages === 0) {
    return <p className="text-gray-500">No images found in question pools</p>;
  }

  const displayedDescriptions = showAll
    ? result.descriptions
    : result.descriptions.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span>
          Total: <strong>{result.totalImages}</strong>
        </span>
        <span className="text-green-600">
          Cache hits: <strong>{result.cacheHits}</strong>
        </span>
        <span className="text-yellow-600">
          Cache misses: <strong>{result.cacheMisses}</strong>
        </span>
        <span className="text-blue-600">
          Generated: <strong>{result.generatedCount}</strong>
        </span>
      </div>

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Image</th>
            <th className="px-3 py-2 text-left">Description</th>
            <th className="px-3 py-2 text-left">Cached</th>
          </tr>
        </thead>
        <tbody>
          {displayedDescriptions.map((entry, i) => (
            <tr
              key={i}
              className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} align-top`}
            >
              <td className="px-3 py-2">
                <div className="flex flex-col gap-1">
                  <img
                    src={entry.url}
                    alt="Quiz image"
                    className="h-20 w-auto rounded border object-contain"
                  />
                  <span className="max-w-[200px] truncate font-mono text-xs text-gray-400">
                    {entry.url.split("/").pop()}
                  </span>
                </div>
              </td>
              <td className="max-w-md px-3 py-2">{entry.description}</td>
              <td className="px-3 py-2">
                {entry.wasCached ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-yellow-600">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {result.descriptions.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-blue-600 text-sm hover:underline"
        >
          {showAll ? "Show less" : `Show all ${result.descriptions.length}`}
        </button>
      )}
    </div>
  );
}

// Composer Section
function ComposerSection({
  prompt,
  response,
  selectedQuestions,
}: {
  prompt: string;
  response: {
    overallStrategy: string;
    selectedQuestions: { questionUid: string; reasoning: string }[];
  };
  selectedQuestions: RagQuizQuestion[];
}) {
  const [showPrompt, setShowPrompt] = useState(false);

  const copyPrompt = () => {
    void navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium">Composition Prompt</h4>
          <div className="flex gap-2">
            <span className="text-sm text-gray-500">
              {prompt.length.toLocaleString()} chars
            </span>
            <button
              onClick={copyPrompt}
              className="text-blue-600 text-sm hover:underline"
            >
              Copy
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-blue-600 text-sm hover:underline"
            >
              {showPrompt ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {showPrompt && (
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-4 font-mono text-xs">
            {prompt}
          </pre>
        )}
      </div>

      {/* Response */}
      <div>
        <h4 className="mb-2 font-medium">LLM Response</h4>
        <div className="bg-blue-50 rounded p-3">
          <p className="text-sm font-medium">Overall Strategy:</p>
          <p className="text-sm text-gray-700">{response.overallStrategy}</p>
        </div>

        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">
            Selected Questions ({response.selectedQuestions.length}):
          </p>
          {response.selectedQuestions.map((selection, i) => {
            const question = selectedQuestions.find(
              (q) => q.sourceUid === selection.questionUid,
            );
            return (
              <div key={i} className="rounded border bg-gray-50 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <span className="font-mono text-xs text-gray-500">
                    {i + 1}. {selection.questionUid}
                  </span>
                </div>
                <p className="mb-2 text-sm italic text-gray-600">
                  {selection.reasoning}
                </p>
                {question && (
                  <MathJaxWrap>
                    <p className="text-sm">{question.question.question}</p>
                  </MathJaxWrap>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Final Quiz Display
function FinalQuizDisplay({
  questions,
  quiz,
}: {
  questions: RagQuizQuestion[];
  quiz: QuizRagDebugResult["finalQuiz"];
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <span>
          Questions: <strong>{quiz.questions.length}</strong>
        </span>
        <span>
          Images: <strong>{quiz.imageMetadata?.length ?? 0}</strong>
        </span>
        <span>
          Version: <strong>{quiz.version}</strong>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {questions.map((q, i) => (
          <div key={q.sourceUid}>
            <p className="mb-1 text-sm font-medium text-gray-500">
              Question {i + 1}
            </p>
            <QuestionCard question={q} />
          </div>
        ))}
      </div>
    </div>
  );
}
