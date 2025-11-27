"use client";

import { useState } from "react";

import type { MLMultiTermDebugResult } from "@oakai/aila/src/core/quiz/debug";
import type { MLSearchTermDebugResult } from "@oakai/aila/src/core/quiz/debug/types";

import { LearnBlock } from "../view";
import { QuestionCard } from "./QuestionCard";

// Helper to format ms as seconds
function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + "s";
}

interface MLPipelineDetailsProps {
  result: MLMultiTermDebugResult;
}

export function MLPipelineDetails({ result }: MLPipelineDetailsProps) {
  return (
    <div className="space-y-6">
      {result.searchTerms.map((term, idx) => (
        <SearchTermAccordion key={idx} term={term} index={idx} />
      ))}
    </div>
  );
}

function SearchTermAccordion({
  term,
  index,
}: {
  term: MLSearchTermDebugResult;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllES, setShowAllES] = useState(false);
  const [showAllCohere, setShowAllCohere] = useState(false);

  const displayedESHits = showAllES
    ? term.elasticsearchHits
    : term.elasticsearchHits.slice(0, 10);
  const displayedCohereResults = showAllCohere
    ? term.cohereResults
    : term.cohereResults.slice(0, 10);

  return (
    <div className="rounded-lg border bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <div>
          <span className="font-medium">Query {index + 1}:</span>{" "}
          <span className="text-gray-600">&quot;{term.query}&quot;</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500">
            {formatSeconds(term.timingMs)}
          </span>
          <span className="text-sm text-gray-500">
            {term.finalCandidates.length} candidates
          </span>
          <span className="ml-4 text-gray-400">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-6 border-t p-4">
          {/* Elasticsearch Results */}
          <section>
            <h4 className="mb-2 font-medium">
              Elasticsearch Hits ({term.elasticsearchHits.length} total)
            </h4>
            <LearnBlock>
              <p className="text-sm text-gray-600">
                These are the raw results from Elasticsearch hybrid search. The
                score combines BM25 text relevance (keyword matching) with
                vector similarity (semantic meaning). Higher scores indicate
                better matches to the search query.
              </p>
            </LearnBlock>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Question UID</th>
                    <th className="px-3 py-2 text-left">Text Preview</th>
                    <th className="px-3 py-2 text-left">Lesson</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedESHits.map((hit, i) => (
                    <tr
                      key={hit.questionUid}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 font-mono">
                        {hit.score.toFixed(3)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {hit.questionUid}
                      </td>
                      <td className="max-w-2xl px-3 py-2">
                        <span className="line-clamp-4">
                          {hit.text.substring(0, 500)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{hit.lessonSlug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {term.elasticsearchHits.length > 10 && (
              <button
                onClick={() => setShowAllES(!showAllES)}
                className="text-blue-600 mt-2 text-sm hover:underline"
              >
                {showAllES
                  ? "Show less"
                  : `Show all ${term.elasticsearchHits.length}`}
              </button>
            )}
          </section>

          {/* Cohere Reranking Results */}
          <section>
            <h4 className="mb-2 font-medium">
              Cohere Reranking ({term.cohereResults.length} results)
            </h4>
            <LearnBlock>
              <p className="text-sm text-gray-600">
                Cohere&apos;s reranker uses a cross-encoder model to score how
                well each question matches the search query. Unlike embedding
                similarity, it considers the full context of both texts
                together. The top 3 (highlighted in green) become candidates for
                the final quiz.
              </p>
            </LearnBlock>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Rank</th>
                    <th className="px-3 py-2 text-left">Relevance</th>
                    <th className="px-3 py-2 text-left">Original Index</th>
                    <th className="px-3 py-2 text-left">Question UID</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCohereResults.map((result, rank) => (
                    <tr
                      key={result.questionUid}
                      className={
                        rank < 3
                          ? "bg-green-50"
                          : rank % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                      }
                    >
                      <td className="px-3 py-2">{rank + 1}</td>
                      <td className="px-3 py-2 font-mono">
                        {result.relevanceScore.toFixed(4)}
                      </td>
                      <td className="px-3 py-2">{result.originalIndex}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {result.questionUid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {term.cohereResults.length > 10 && (
              <button
                onClick={() => setShowAllCohere(!showAllCohere)}
                className="text-blue-600 mt-2 text-sm hover:underline"
              >
                {showAllCohere
                  ? "Show less"
                  : `Show all ${term.cohereResults.length}`}
              </button>
            )}
          </section>

          {/* Final Candidates */}
          <section>
            <h4 className="mb-2 font-medium">
              Final Candidates ({term.finalCandidates.length})
            </h4>
            <div className="space-y-2">
              {term.finalCandidates.map((q) => (
                <QuestionCard key={q.sourceUid} question={q} compact />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
