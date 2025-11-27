"use client";

import type { RagQuizQuestion } from "@oakai/aila/src/core/quiz/interfaces";

import { MathJaxWrap } from "@/components/MathJax";

interface QuestionCardProps {
  question: RagQuizQuestion;
  compact?: boolean;
}

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  const q = question.question;

  if (compact) {
    return (
      <div className="rounded border bg-gray-50 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-xs text-gray-500">{question.sourceUid}</span>
            <MathJaxWrap>
              <p className="mt-1 text-sm">{q.question}</p>
            </MathJaxWrap>
          </div>
          <span className="bg-blue-100 text-blue-700 whitespace-nowrap rounded px-2 py-1 text-xs">
            {q.questionType}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <span className="font-mono text-xs text-gray-500">
          {question.sourceUid}
        </span>
        <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium">
          {q.questionType}
        </span>
      </div>

      <MathJaxWrap>
        <p className="mb-4 font-medium">{q.question}</p>
      </MathJaxWrap>

      {q.questionType === "multiple-choice" && (
        <div className="space-y-2">
          <div>
            <p className="text-xs font-medium text-green-700">
              Correct answers:
            </p>
            <MathJaxWrap>
              <ul className="ml-4 list-disc text-sm">
                {q.answers.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </MathJaxWrap>
          </div>
          <div>
            <p className="text-xs font-medium text-red-700">Distractors:</p>
            <MathJaxWrap>
              <ul className="ml-4 list-disc text-sm text-gray-600">
                {q.distractors.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </MathJaxWrap>
          </div>
        </div>
      )}

      {q.questionType === "short-answer" && (
        <div>
          <p className="text-xs font-medium text-green-700">
            Acceptable answers:
          </p>
          <MathJaxWrap>
            <ul className="ml-4 list-disc text-sm">
              {q.answers.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </MathJaxWrap>
        </div>
      )}

      {q.questionType === "match" && (
        <div>
          <p className="text-xs font-medium text-gray-700">Pairs:</p>
          <MathJaxWrap>
            <ul className="ml-4 text-sm">
              {q.pairs.map((p, i) => (
                <li key={i}>
                  {p.left} → {p.right}
                </li>
              ))}
            </ul>
          </MathJaxWrap>
        </div>
      )}

      {q.questionType === "order" && (
        <div>
          <p className="text-xs font-medium text-gray-700">Correct order:</p>
          <MathJaxWrap>
            <ol className="ml-4 list-decimal text-sm">
              {q.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </MathJaxWrap>
        </div>
      )}

      {question.imageMetadata.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <p className="mb-2 text-xs text-gray-500">
            Contains {question.imageMetadata.length} image(s):
          </p>
          <div className="flex flex-wrap gap-2">
            {question.imageMetadata.map((img, i) => (
              <img
                key={i}
                src={img.imageUrl}
                alt={`Question image ${i + 1}`}
                className="h-16 w-auto rounded border object-contain"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
