"use client";

import type { RagQuizQuestion } from "@oakai/aila/src/core/quiz/interfaces";

import { MathJaxWrap } from "@/components/MathJax";

interface QuestionCardProps {
  question: RagQuizQuestion;
  compact?: boolean;
}

// Parse text and render inline images from markdown syntax
function RenderTextWithImages({ text }: { text: string }) {
  // Match markdown image syntax: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const parts: (string | { type: "image"; url: string; alt: string })[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(text)) !== null) {
    // Add text before the image
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the image
    const url = match[2];
    const alt = match[1];
    parts.push({ type: "image", url: url ?? "", alt: alt ?? "" });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return <span>{text}</span>;
  }

  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <img
            key={i}
            src={part.url}
            alt={part.alt || "Question image"}
            className="my-2 inline-block max-h-32 rounded border"
          />
        ),
      )}
    </>
  );
}

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  const q = question.question;

  if (compact) {
    return (
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-xs text-gray-500">{question.sourceUid}</span>
            <MathJaxWrap>
              <p className="mt-1 text-sm">
                <RenderTextWithImages text={q.question} />
              </p>
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
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <span className="font-mono text-xs text-gray-500">
          {question.sourceUid}
        </span>
        <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-medium">
          {q.questionType}
        </span>
      </div>

      <MathJaxWrap>
        <div className="mb-4 text-base font-medium">
          <RenderTextWithImages text={q.question} />
        </div>
      </MathJaxWrap>

      {q.questionType === "multiple-choice" && (
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-medium text-green-700">
              Correct answers:
            </p>
            <MathJaxWrap>
              <ul className="ml-6 list-disc space-y-1 text-sm">
                {q.answers.map((a, i) => (
                  <li key={i}>
                    <RenderTextWithImages text={a} />
                  </li>
                ))}
              </ul>
            </MathJaxWrap>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-red-700">
              Distractors:
            </p>
            <MathJaxWrap>
              <ul className="ml-6 list-disc space-y-1 text-sm text-gray-600">
                {q.distractors.map((d, i) => (
                  <li key={i}>
                    <RenderTextWithImages text={d} />
                  </li>
                ))}
              </ul>
            </MathJaxWrap>
          </div>
        </div>
      )}

      {q.questionType === "short-answer" && (
        <div>
          <p className="mb-1 text-sm font-medium text-green-700">
            Acceptable answers:
          </p>
          <MathJaxWrap>
            <ul className="ml-6 list-disc space-y-1 text-sm">
              {q.answers.map((a, i) => (
                <li key={i}>
                  <RenderTextWithImages text={a} />
                </li>
              ))}
            </ul>
          </MathJaxWrap>
        </div>
      )}

      {q.questionType === "match" && (
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Pairs:</p>
          <MathJaxWrap>
            <ul className="ml-6 space-y-1 text-sm">
              {q.pairs.map((p, i) => (
                <li key={i}>
                  <RenderTextWithImages text={p.left} /> →{" "}
                  <RenderTextWithImages text={p.right} />
                </li>
              ))}
            </ul>
          </MathJaxWrap>
        </div>
      )}

      {q.questionType === "order" && (
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">
            Correct order:
          </p>
          <MathJaxWrap>
            <ol className="ml-6 list-decimal space-y-1 text-sm">
              {q.items.map((item, i) => (
                <li key={i}>
                  <RenderTextWithImages text={item} />
                </li>
              ))}
            </ol>
          </MathJaxWrap>
        </div>
      )}
    </div>
  );
}
