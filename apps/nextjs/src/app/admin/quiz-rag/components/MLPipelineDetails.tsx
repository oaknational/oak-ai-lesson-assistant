"use client";

import { useState } from "react";

import type { MLMultiTermDebugResult } from "@oakai/aila/src/core/quiz/debug";
import type { MLSearchTermDebugResult } from "@oakai/aila/src/core/quiz/debug/types";

import { QuestionCard } from "./QuestionCard";

interface MLPipelineDetailsProps {
  result: MLMultiTermDebugResult;
}

export function MLPipelineDetails({ result }: MLPipelineDetailsProps) {
  const totalCandidates = result.pools.reduce(
    (sum, p) => sum + p.questions.length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ML Multi-Term Generator</h3>
        <span className="text-sm text-gray-500">
          {result.searchTerms.length} queries, {totalCandidates} total
          candidates, {result.timingMs}ms
        </span>
      </div>

      <div className="space-y-3">
        {result.searchTerms.map((term, idx) => (
          <SearchTermAccordion key={idx} term={term} index={idx} />
        ))}
      </div>
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
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{term.timingMs}ms</span>
          <span className="text-sm text-gray-500">
            {term.finalCandidates.length} candidates
          </span>
          <span className="text-gray-400">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-6 border-t p-4">
          {/* Elasticsearch Results */}
          <section>
            <h4 className="mb-2 font-medium">
              Elasticsearch Hits ({term.elasticsearchHits.length} total)
            </h4>
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
                      <td className="max-w-md truncate px-3 py-2">
                        {hit.text.substring(0, 100)}...
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
