"use client";

import { createContext, useContext, useState } from "react";

import type { ReportNode } from "@oakai/aila/src/core/quiz/instrumentation";
import type {
  QuizQuestionPool,
  RagQuizQuestion,
} from "@oakai/aila/src/core/quiz/interfaces";

import { QuizSection } from "@/components/AppComponents/SectionContent/QuizSection";
import { MathJaxWrap } from "@/components/MathJax";

import { MLPipelineDetails } from "./components/MLPipelineDetails";
import { QuestionCard } from "./components/QuestionCard";
import type { ViewMode } from "./page";
import type { QuizDebugResult } from "./useStreamingDebug";
import { formatSeconds } from "./utils";

/**
 * Helper to safely get a child node from the report tree
 */
function getChild(
  node: ReportNode | undefined,
  name: string,
): ReportNode | undefined {
  return node?.children[name];
}

/**
 * Generator result data extracted from ReportNode
 */
interface GeneratorData {
  pools: QuizQuestionPool[];
  timingMs?: number;
  metadata?: { sourceLesson?: string };
}

/**
 * Image descriptions data extracted from ReportNode
 */
interface ImageDescriptionsData {
  totalImages: number;
  cacheHits: number;
  cacheMisses: number;
  generatedCount: number;
  descriptions: Array<{ url: string; description: string; wasCached: boolean }>;
  timingMs?: number;
}

// Context for view mode
export const ViewModeContext = createContext<ViewMode>("learn");
export const useViewMode = () => useContext(ViewModeContext);

interface QuizRagDebugViewProps {
  result: QuizDebugResult | null;
  viewMode: ViewMode;
  report: ReportNode | null;
  isStreaming?: boolean;
}

/**
 * Extract generator data from a ReportNode
 */
function extractGeneratorData(
  node: ReportNode | undefined,
): GeneratorData | undefined {
  if (!node) return undefined;
  const pools = node.data.pools as QuizQuestionPool[] | undefined;
  if (!pools) return undefined;
  return {
    pools,
    timingMs: node.durationMs,
    metadata: node.data.metadata as { sourceLesson?: string } | undefined,
  };
}

/**
 * Extract image descriptions data from a ReportNode
 */
function extractImageDescriptions(
  node: ReportNode | undefined,
): ImageDescriptionsData | undefined {
  if (!node?.data) return undefined;
  const { totalImages, cacheHits, cacheMisses, generatedCount, descriptions } =
    node.data as {
      totalImages?: number;
      cacheHits?: number;
      cacheMisses?: number;
      generatedCount?: number;
      descriptions?: Array<{
        url: string;
        description: string;
        wasCached: boolean;
      }>;
    };
  if (totalImages === undefined) return undefined;
  return {
    totalImages,
    cacheHits: cacheHits ?? 0,
    cacheMisses: cacheMisses ?? 0,
    generatedCount: generatedCount ?? 0,
    descriptions: descriptions ?? [],
    timingMs: node.durationMs,
  };
}

export function QuizRagDebugView({
  result,
  viewMode,
  report,
  isStreaming = false,
}: QuizRagDebugViewProps) {
  // Helper to check stage status from report tree
  const getNodeStatus = (path: string[]) => {
    let node: ReportNode | undefined = report ?? undefined;
    for (const segment of path) {
      node = node?.children[segment];
    }
    return node?.status;
  };

  const isStageLoading = (path: string[]) => getNodeStatus(path) === "running";
  const isStageComplete = (path: string[]) =>
    getNodeStatus(path) === "complete";

  // Extract data from report tree
  const basedOnRagNode = getChild(report ?? undefined, "basedOnRag");
  const ailaRagNode = getChild(report ?? undefined, "ailaRag");
  const mlMultiTermNode = getChild(report ?? undefined, "mlMultiTerm");
  const selectorNode = getChild(report ?? undefined, "selector");
  const imageDescriptionsNode = getChild(selectorNode, "imageDescriptions");
  const composerPromptNode = getChild(selectorNode, "composerPrompt");
  const composerLlmNode = getChild(selectorNode, "composerLlm");

  // Get data from nodes
  const basedOnRag = extractGeneratorData(basedOnRagNode);
  const ailaRag = extractGeneratorData(ailaRagNode);
  const mlMultiTerm = extractGeneratorData(mlMultiTermNode);
  const imageDescriptions = extractImageDescriptions(imageDescriptionsNode);

  return (
    <ViewModeContext.Provider value={viewMode}>
      <div>
        {/* Stage 1: Generators */}
        <div className="h-12" />
        <LearnBlock variant="section">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Stage 1: Generators
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600">
            Generators retrieve candidate questions from different sources. Each
            generator produces &quot;pools&quot; of questions that feed into the
            next stages of the pipeline.
          </p>
        </LearnBlock>
        <div className="space-y-6">
          <LearnBlock variant="section">
            <p className="max-w-3xl text-base leading-relaxed text-gray-600">
              <strong>BasedOnRag</strong> retrieves questions from the specific
              Oak lesson that this lesson plan is based on. Only available when
              the user selected a &quot;based on&quot; lesson.
            </p>
          </LearnBlock>
          <GeneratorAccordion
            title="BasedOnRag"
            disabled={!basedOnRag && isStageComplete(["basedOnRag"])}
            disabledReason="no basedOn"
            loading={isStageLoading(["basedOnRag"])}
            stats={
              basedOnRag
                ? {
                    pools: basedOnRag.pools.length,
                    questions: basedOnRag.pools.reduce(
                      (sum, p) => sum + p.questions.length,
                      0,
                    ),
                    timing: basedOnRag.timingMs ?? 0,
                  }
                : undefined
            }
          >
            {basedOnRag && <GeneratorSection result={basedOnRag} />}
          </GeneratorAccordion>

          <LearnBlock variant="section">
            <p className="max-w-3xl text-base leading-relaxed text-gray-600">
              <strong>AilaRag</strong> uses lessons that were identified as
              relevant during the chat conversation. These are lessons that Aila
              found while helping create the lesson plan.
            </p>
          </LearnBlock>
          <GeneratorAccordion
            title="AilaRag"
            disabled={!ailaRag && isStageComplete(["rag"])}
            disabledReason="no relevant lessons"
            loading={isStageLoading(["rag"])}
            stats={
              ailaRag
                ? {
                    pools: ailaRag.pools.length,
                    questions: ailaRag.pools.reduce(
                      (sum, p) => sum + p.questions.length,
                      0,
                    ),
                    timing: ailaRag.timingMs ?? 0,
                  }
                : undefined
            }
          >
            {ailaRag && <GeneratorSection result={ailaRag} />}
          </GeneratorAccordion>

          <LearnBlock variant="section">
            <div className="max-w-3xl text-base leading-relaxed text-gray-600">
              <p className="mb-3">
                <strong>ML Multi-Term</strong> is the most sophisticated
                generator.
              </p>
              <ol className="list-inside list-decimal space-y-2">
                <li>
                  <strong>Query generation:</strong> An LLM generates 6 semantic
                  search queries targeting prior knowledge (starter) or learning
                  outcomes (exit).
                </li>
                <li>
                  <strong>Hybrid search:</strong> Each query runs against
                  Elasticsearch using BM25 + vector similarity.
                </li>
                <li>
                  <strong>Reranking:</strong> Cohere reranks results by
                  relevance to the query.
                </li>
                <li>
                  <strong>Selection:</strong> The top 3 questions per query
                  become candidates.
                </li>
              </ol>
            </div>
          </LearnBlock>
          <GeneratorAccordion
            title="ML Multi-Term"
            disabled={!mlMultiTerm && isStageComplete(["mlMultiTerm"])}
            loading={isStageLoading(["mlMultiTerm"])}
            stats={
              mlMultiTerm
                ? {
                    pools: mlMultiTerm.pools.length,
                    questions: mlMultiTerm.pools.reduce(
                      (sum, p) => sum + p.questions.length,
                      0,
                    ),
                    timing: mlMultiTerm.timingMs ?? 0,
                  }
                : undefined
            }
            defaultOpen
          >
            {mlMultiTerm && mlMultiTermNode && (
              <MLPipelineDetails
                result={mlMultiTerm}
                reportNode={mlMultiTermNode}
              />
            )}
          </GeneratorAccordion>
        </div>

        {/* Stage 2: Image Descriptions */}
        <div className="h-24" />
        <LearnBlock variant="section">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Stage 2: Image Descriptions
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600">
            Many quiz questions contain mathematical diagrams and images. We
            generate text descriptions using GPT-4o vision so they can be
            included in the text-based composition prompt. Descriptions are
            cached in Upstash to avoid regenerating them on every request.
          </p>
        </LearnBlock>
        <Section
          title="Image Descriptions"
          color="lemon"
          loading={isStageLoading(["selector", "imageDescriptions"])}
          stats={
            imageDescriptions
              ? `${imageDescriptions.totalImages} images, ${imageDescriptions.cacheHits} cached, ${formatSeconds(imageDescriptions.timingMs ?? 0)}`
              : undefined
          }
        >
          {imageDescriptions ? (
            <ImageDescriptionsView result={imageDescriptions} />
          ) : (
            <p className="text-gray-400">Waiting for image processing...</p>
          )}
        </Section>

        {/* Stage 3: LLM Composer */}
        <div className="h-24" />
        <LearnBlock variant="section">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Stage 3: LLM Composer
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600">
            The composer (o4-mini) receives all candidate questions (with image
            descriptions substituted for images) and the lesson plan context. It
            selects 6 questions that best match the lesson&apos;s learning
            objectives, ensuring variety in question types and appropriate
            difficulty progression.
          </p>
        </LearnBlock>
        <Section
          title="LLM Composer"
          color="lavender"
          loading={isStageLoading(["selector", "composerLlm"])}
          stats={
            composerLlmNode?.status === "complete"
              ? (() => {
                  const totalCandidates = [
                    ...(basedOnRag?.pools ?? []),
                    ...(ailaRag?.pools ?? []),
                    ...(mlMultiTerm?.pools ?? []),
                  ].reduce((sum, pool) => sum + pool.questions.length, 0);
                  const selectedCount =
                    (
                      composerLlmNode.data.selectedQuestions as
                        | RagQuizQuestion[]
                        | undefined
                    )?.length ?? 0;
                  return `${totalCandidates} candidates, ${selectedCount} selected, ${formatSeconds(composerLlmNode.durationMs ?? 0)}`;
                })()
              : undefined
          }
        >
          {composerLlmNode?.status === "complete" ? (
            <ComposerSection
              prompt={(composerPromptNode?.data.prompt as string) ?? ""}
              response={
                composerLlmNode.data.response as {
                  overallStrategy: string;
                  selectedQuestions: {
                    questionUid: string;
                    reasoning: string;
                  }[];
                }
              }
              selectedQuestions={
                (composerLlmNode.data.selectedQuestions as RagQuizQuestion[]) ??
                []
              }
              pools={[
                ...(basedOnRag?.pools ?? []),
                ...(ailaRag?.pools ?? []),
                ...(mlMultiTerm?.pools ?? []),
              ]}
            />
          ) : composerPromptNode?.data.prompt ? (
            <ComposerPromptPreview
              prompt={composerPromptNode.data.prompt as string}
              isLlmRunning={composerLlmNode?.status === "running"}
            />
          ) : (
            <p className="text-gray-400">Waiting for LLM composition...</p>
          )}
        </Section>

        {/* Final Quiz */}
        <div className="h-24" />
        <LearnBlock variant="section">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            Final Output
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600">
            The final quiz contains the 6 selected questions in the order chosen
            by the composer. This is the output that gets returned to the lesson
            plan.
          </p>
        </LearnBlock>
        <Section
          title="Final Quiz"
          defaultOpen
          color="pink"
          stats={
            result?.quiz
              ? `${result.quiz.questions.length} questions, ${formatSeconds(report?.durationMs ?? 0)} total`
              : undefined
          }
        >
          {result?.quiz ? (
            <FinalQuizDisplay quiz={result.quiz} report={report} />
          ) : (
            <p className="text-gray-400">Waiting for quiz generation...</p>
          )}
        </Section>
      </div>
    </ViewModeContext.Provider>
  );
}

// Component that only renders in Learn mode
export function LearnBlock({
  children,
  variant = "inline",
}: {
  children: React.ReactNode;
  variant?: "hero" | "section" | "inline";
}) {
  const mode = useViewMode();
  if (mode !== "learn") return null;

  const styles = {
    hero: "mb-10",
    section: "mb-8",
    inline: "rounded-lg border border-blue-100 bg-blue-50 px-6 py-5 mb-8",
  };

  return <div className={styles[variant]}>{children}</div>;
}

// Standard paragraph styling for learn content
const learnParagraphClass = "max-w-3xl text-base leading-relaxed text-gray-600";

// Paragraph component that only renders in Learn mode
export function LearnParagraph({ children }: { children: React.ReactNode }) {
  const mode = useViewMode();
  if (mode !== "learn") return null;
  return <p className={learnParagraphClass}>{children}</p>;
}

// Stage color mapping
type StageColor = "mint" | "lemon" | "lavender" | "pink" | "gray";
const stageColors: Record<StageColor, { bg: string; border: string }> = {
  mint: { bg: "bg-mint30", border: "border-mint" },
  lemon: { bg: "bg-lemon30", border: "border-lemon" },
  lavender: { bg: "bg-lavender30", border: "border-lavender" },
  pink: { bg: "bg-pink30", border: "border-pink" },
  gray: { bg: "bg-white", border: "border-gray-200" },
};

// Collapsible SubSection Component (for nested accordions within sections)
function SubSection({
  title,
  children,
  defaultOpen = false,
  stats,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  stats?: string;
  actions?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-gray-50"
      >
        <span className="font-medium">{title}</span>
        <div className="flex items-center gap-4">
          {stats && <span className="text-sm text-gray-500">{stats}</span>}
          {actions && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
          <span className="text-gray-400">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>
      {isOpen && <div className="border-t px-4 py-3">{children}</div>}
    </div>
  );
}

// Collapsible Section Component
function Section({
  title,
  children,
  defaultOpen = false,
  color = "gray",
  stats,
  loading = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: StageColor;
  stats?: string;
  loading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colors = stageColors[color];

  return (
    <div
      className={`rounded-xl border-2 ${colors.border} ${colors.bg} shadow-sm`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-8 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="animate-spin">⚙️</span>
          ) : stats ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-gray-400">⏳</span>
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-6">
          {stats && <span className="text-sm text-gray-600">{stats}</span>}
          {loading && <span className="text-blue-600 text-sm">Running...</span>}
          <span className="text-gray-400">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>
      {isOpen && <div className="border-t px-8 py-5">{children}</div>}
    </div>
  );
}

// Generator Accordion - collapsible section for each generator
function GeneratorAccordion({
  title,
  stats,
  children,
  defaultOpen = false,
  disabled = false,
  disabledReason,
  loading = false,
}: {
  title: string;
  stats?: { pools: number; questions: number; timing: number };
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen && !disabled);

  if (disabled) {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50">
        <div className="flex w-full items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-gray-400">{title}</span>
          <span className="text-sm text-gray-400">{disabledReason}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-mint bg-mint30 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="animate-spin">⚙️</span>
          ) : stats ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-gray-400">⏳</span>
          )}
          <span className="text-lg font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {loading && !stats && (
            <span className="text-blue-600 text-sm">Running...</span>
          )}
          {stats && (
            <>
              <span className="text-sm text-gray-600">
                {stats.pools} {stats.pools === 1 ? "pool" : "pools"}
              </span>
              <span className="text-sm text-gray-600">
                {stats.questions}{" "}
                {stats.questions === 1 ? "question" : "questions"}
              </span>
              <span className="text-sm text-gray-600">
                {formatSeconds(stats.timing)}
              </span>
            </>
          )}
          <span className="ml-2 text-gray-400">{isOpen ? "▼" : "▶"}</span>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-mint px-5 py-4">{children}</div>
      )}
    </div>
  );
}

// Generator Section for basedOnRag and ailaRag
function GeneratorSection({ result }: { result: GeneratorData }) {
  return (
    <div className="space-y-3">
      {result.metadata?.sourceLesson && (
        <p className="text-sm text-gray-600">
          Source: {result.metadata.sourceLesson}
        </p>
      )}
      <div className="space-y-2">
        {result.pools.map((pool, idx) => (
          <div key={idx} className="rounded-lg border bg-white p-4">
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
function ImageDescriptionsView({ result }: { result: ImageDescriptionsData }) {
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
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <img
                    src={entry.url}
                    alt="Quiz image"
                    className="h-32 w-auto rounded border object-contain"
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

// Helper to format pool source for display
function formatPoolSource(pool: QuizQuestionPool): string {
  switch (pool.source.type) {
    case "basedOn":
      return `BasedOn: ${pool.source.lessonTitle}`;
    case "ailaRag":
      return `AilaRag: ${pool.source.lessonTitle}`;
    case "mlSemanticSearch":
      return `ML: "${pool.source.semanticQuery}"`;
  }
}

// Composer Prompt Preview - shown while LLM is generating
function ComposerPromptPreview({
  prompt,
  isLlmRunning,
}: {
  prompt: string;
  isLlmRunning: boolean;
}) {
  const copyPrompt = () => {
    void navigator.clipboard.writeText(prompt);
  };

  return (
    <div className="space-y-8">
      <SubSection
        title="Composition Prompt"
        stats={`${prompt.length.toLocaleString()} chars`}
        actions={
          <button
            onClick={copyPrompt}
            className="text-blue-600 text-sm hover:underline"
          >
            Copy
          </button>
        }
      >
        <LearnBlock>
          <p className="text-sm text-gray-600">
            The full prompt sent to the LLM, including all candidate questions
            with their text, answers, and image descriptions. The model uses
            this to select the best 6 questions for the quiz.
          </p>
        </LearnBlock>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-4 font-mono text-xs">
          {prompt}
        </pre>
      </SubSection>

      {isLlmRunning && (
        <div className="py-8 text-center text-gray-500">
          <span className="mr-2 inline-block animate-spin">⚙️</span>
          Generating quiz selections...
        </div>
      )}
    </div>
  );
}

// Composer Section
function ComposerSection({
  prompt,
  response,
  selectedQuestions,
  pools,
}: {
  prompt: string;
  response: {
    overallStrategy: string;
    selectedQuestions: { questionUid: string; reasoning: string }[];
  };
  selectedQuestions: RagQuizQuestion[];
  pools: QuizQuestionPool[];
}) {
  const copyPrompt = () => {
    void navigator.clipboard.writeText(prompt);
  };

  // Build a map of questionUid -> pool source
  const questionToPool = new Map<string, QuizQuestionPool>();
  pools.forEach((pool) => {
    pool.questions.forEach((q) => {
      questionToPool.set(q.sourceUid, pool);
    });
  });

  return (
    <div className="space-y-8">
      <SubSection
        title="Composition Prompt"
        stats={`${prompt.length.toLocaleString()} chars`}
        actions={
          <button
            onClick={copyPrompt}
            className="text-blue-600 text-sm hover:underline"
          >
            Copy
          </button>
        }
      >
        <LearnBlock>
          <p className="text-sm text-gray-600">
            The full prompt sent to the LLM, including all candidate questions
            with their text, answers, and image descriptions. The model uses
            this to select the best 6 questions for the quiz.
          </p>
        </LearnBlock>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-4 font-mono text-xs">
          {prompt}
        </pre>
      </SubSection>

      <SubSection title="Overall Strategy" defaultOpen>
        <LearnBlock>
          <p className="text-sm text-gray-600">
            The model&apos;s high-level reasoning about how it approached
            selecting questions, including considerations for topic coverage,
            difficulty progression, and learning objectives.
          </p>
        </LearnBlock>
        <p className="text-sm text-gray-700">{response.overallStrategy}</p>
      </SubSection>

      <SubSection
        title="Selection Reasoning"
        stats={`${response.selectedQuestions.length} questions`}
        defaultOpen
      >
        <LearnBlock>
          <p className="text-sm text-gray-600">
            The model&apos;s reasoning for each selected question, explaining
            why it was chosen and how it fits into the overall quiz structure.
          </p>
        </LearnBlock>
        <div className="space-y-2">
          {response.selectedQuestions.map((selection, i) => {
            const question = selectedQuestions.find(
              (q) => q.sourceUid === selection.questionUid,
            );
            const pool = questionToPool.get(selection.questionUid);
            return (
              <div key={i} className="rounded border bg-gray-50 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <span className="font-mono text-xs text-gray-500">
                    {i + 1}. {selection.questionUid}
                  </span>
                  {pool && (
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      {formatPoolSource(pool)}
                    </span>
                  )}
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
      </SubSection>
    </div>
  );
}

// Final Quiz Display
function FinalQuizDisplay({
  quiz,
  report,
}: {
  quiz: QuizDebugResult["quiz"];
  report: ReportNode | null;
}) {
  const mode = useViewMode();
  const [showJson, setShowJson] = useState(mode === "eval");

  const copyQuizJson = () => {
    void navigator.clipboard.writeText(JSON.stringify(quiz, null, 2));
  };

  const copyFullReport = () => {
    void navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-xl rounded-lg border bg-white p-12">
        <QuizSection quizSection={quiz} />
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={copyQuizJson}
          className="text-blue-600 text-sm hover:underline"
        >
          Copy Quiz JSON
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={copyFullReport}
          className="text-blue-600 text-sm hover:underline"
        >
          Copy Full Report
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setShowJson(!showJson)}
          className="text-blue-600 text-sm hover:underline"
        >
          {showJson ? "Hide" : "Show"} JSON
        </button>
      </div>

      {showJson && (
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-4 font-mono text-xs">
          {JSON.stringify(quiz, null, 2)}
        </pre>
      )}
    </div>
  );
}
