/* eslint-disable no-console */

/**
 * Agentic Issue Scoring Harness
 *
 * Runs the agentic pipeline multiple times and scores outputs against
 * known behavioural issues.
 *
 * Run with:
 *   cd packages/aila && SCORE_RUNS=3 pnpm with-env npx jest \
 *     --testMatch="**\/scoring/scoreAgenticIssues.ts" --testTimeout=600000
 *
 * Configure runs per scenario with SCORE_RUNS env var (default 3).
 * Output: packages/aila/src/lib/agentic-system/scoring/scores.yaml
 */
import { execSync } from "child_process";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import YAML from "yaml";

import {
  AMERICANISM_ISSUE_KIND,
  type AmericanismIssueBySection,
} from "../../../features/americanisms";
import { AilaAmericanisms } from "../../../features/americanisms/AilaAmericanisms";
import {
  CompletedLessonPlanSchema,
  type PartialLessonPlan,
} from "../../../protocol/schema";
import { createOpenAIMessageToUserAgent } from "../agents/messageToUserAgent";
import { createOpenAIPlannerAgent } from "../agents/plannerAgent";
import { createSectionAgentRegistry } from "../agents/sectionAgents/sectionAgentRegistry";
import { ailaTurn } from "../ailaTurn";
import type { JsonPatchOperation } from "../compatibility/helpers/immerPatchToJsonPatch";
import type { PlanStep, PlannerOutput, SectionKey } from "../schema";
import type {
  AilaPersistedState,
  AilaRuntimeContext,
  AilaTurnCallbacks,
  ChatMessage,
} from "../types";
import {
  collectMeaningOccurrences,
  formatMeaningEvidence,
} from "./scoreAgenticIssues.helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScorerInput = {
  plannerOutputs: PlannerOutput[];
  finalDocument: PartialLessonPlan;
  allPatches: JsonPatchOperation[];
  finalMessage: string;
  turnCount: number;
  americanismsBySection: AmericanismIssueBySection[];
};

type ScorerResult = {
  /** Quick heuristic signal — not authoritative, just a flag for easy scanning */
  heuristic: "pass" | "flag" | "skip";
  /** The actual extracted content for an agent to review */
  evidence: string;
};

type Scorer = {
  id: string;
  description: string;
  /** Which scenarios this scorer applies to. Omit to apply to all. */
  scenarios?: string[];
  fn: (input: ScorerInput) => ScorerResult;
};

type ScenarioConfig = {
  name: string;
  initialDocument: PartialLessonPlan;
  userMessage: string;
  fetchRelevantLessons: () => Promise<never[]>;
};

type RunCapture = ScorerInput & { error?: string; durationSec: number };

// ---------------------------------------------------------------------------
// Scorers
// ---------------------------------------------------------------------------

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

const SCORERS: Scorer[] = [
  {
    id: "plan-groupings",
    description: "Plan section groupings per turn",
    fn: ({ plannerOutputs, turnCount }) => {
      if (plannerOutputs.length === 0)
        return { heuristic: "skip", evidence: "No planner outputs captured" };

      const EXPECTED_GROUPS: SectionKey[][] = [
        ["learningOutcome", "learningCycles"],
        ["priorKnowledge", "keyLearningPoints", "misconceptions", "keywords"],
        ["starterQuiz", "cycle1", "cycle2", "cycle3", "exitQuiz"],
        ["additionalMaterials"],
      ];

      const lines: string[] = [];
      let anyMismatch = false;

      for (let i = 0; i < plannerOutputs.length; i++) {
        const po = plannerOutputs[i]!;
        if (po.decision !== "plan") {
          lines.push(`Turn ${i + 1}: exit (${po.reasonType})`);
          continue;
        }
        const actual = po.plan.map((s) => s.sectionKey);
        const expected = EXPECTED_GROUPS[i];
        const match =
          expected &&
          actual.length === expected.length &&
          actual.every((k, j) => k === expected[j]);
        const icon = match ? "✓" : "✗";
        if (!match) anyMismatch = true;
        lines.push(`Turn ${i + 1}: ${icon} [${actual.join(", ")}]`);
        if (!match && expected) {
          lines.push(`  expected: [${expected.join(", ")}]`);
        }
      }
      lines.push(`Total: ${turnCount} turns`);
      return {
        heuristic: anyMismatch ? "flag" : "pass",
        evidence: lines.join("\n"),
      };
    },
  },
  {
    id: "additional-materials-tone",
    description: "Additional materials tone (should not be conversational)",
    fn: ({ finalDocument }) => {
      const am = finalDocument.additionalMaterials;
      if (!am)
        return { heuristic: "skip", evidence: "No additionalMaterials field" };
      return {
        heuristic: /\b(I've|I have|Here's|Let me|I'll)\b/i.test(am)
          ? "flag"
          : "pass",
        evidence: am,
      };
    },
  },
  {
    id: "cycle-verbosity",
    description: "Cycle explanation verbosity",
    fn: ({ finalDocument }) => {
      const lines: string[] = [];
      let anyLong = false;
      for (const key of ["cycle1", "cycle2", "cycle3"] as const) {
        const cycle = finalDocument[key];
        if (!cycle?.explanation) {
          lines.push(`${key}: not present`);
          continue;
        }
        const spoken = cycle.explanation.spokenExplanation;
        const text = Array.isArray(spoken) ? spoken.join(" ") : spoken;
        const wc = wordCount(text);
        if (wc >= 200) anyLong = true;
        lines.push(`${key} "${cycle.title}" (${wc} words):`);
        lines.push(text);
        lines.push("");
      }
      return {
        heuristic: anyLong ? "flag" : "pass",
        evidence: lines.join("\n"),
      };
    },
  },
  {
    id: "keyword-casing",
    description: "Keyword definitions (should start with capital letter)",
    fn: ({ finalDocument }) => {
      const keywords = finalDocument.keywords;
      if (!keywords || keywords.length === 0)
        return { heuristic: "skip", evidence: "No keywords" };
      const lines = keywords.map(
        (kw) => `- **${kw.keyword}**: ${kw.definition}`,
      );
      const anyLower = keywords.some(
        (kw) => kw.definition && !/^[A-Z]/.test(kw.definition),
      );
      return {
        heuristic: anyLower ? "flag" : "pass",
        evidence: lines.join("\n"),
      };
    },
  },
  {
    id: "title-no-gerund",
    description: "Title (should not start with a gerund verb)",
    fn: ({ finalDocument }) => {
      const title = finalDocument.title;
      if (!title) return { heuristic: "skip", evidence: "No title" };
      const badPrefixes = [
        "Mastering",
        "Investigating",
        "Exploring",
        "Understanding",
        "Discovering",
        "Learning",
        "Examining",
      ];
      const firstWord = title.split(/\s/)[0] ?? "";
      const isGerund = badPrefixes.some(
        (p) => firstWord.toLowerCase() === p.toLowerCase(),
      );
      return {
        heuristic: isGerund ? "flag" : "pass",
        evidence: title,
      };
    },
  },
  {
    id: "no-basedOn-without-rag",
    description: "basedOn field when RAG returns empty (should be absent)",
    scenarios: ["no-rag-lesson"],
    fn: ({ finalDocument }) => {
      const basedOn = finalDocument.basedOn;
      if (basedOn === null || basedOn === undefined)
        return { heuristic: "pass", evidence: "basedOn is null/undefined" };
      return {
        heuristic: "flag",
        evidence: `basedOn present: ${JSON.stringify(basedOn)}`,
      };
    },
  },
  {
    id: "americanisms-spelling",
    description: "American English spellings (should use British English)",
    fn: ({ americanismsBySection }) => {
      const spellingIssues = americanismsBySection.flatMap(
        ({ section, issues }) =>
          issues
            .filter((i) => i.issue === AMERICANISM_ISSUE_KIND.SPELLING)
            .map((i) => ({ section, ...i })),
      );

      if (spellingIssues.length === 0)
        return {
          heuristic: "pass",
          evidence: "No American English spellings detected",
        };
      return {
        heuristic: "flag",
        evidence: spellingIssues
          .map((i) => `- [${i.section}] "${i.phrase}" → ${i.details}`)
          .join("\n"),
      };
    },
  },
  {
    id: "americanisms-phrasing",
    description:
      "American English phrasing/vocabulary (should use British English phraseology)",
    fn: ({ americanismsBySection }) => {
      const phrasingIssues = americanismsBySection.flatMap(
        ({ section, issues }) =>
          issues
            .filter((i) => i.issue === AMERICANISM_ISSUE_KIND.PHRASING)
            .map((i) => ({ section, ...i })),
      );

      if (phrasingIssues.length === 0)
        return {
          heuristic: "pass",
          evidence: "No American English phrasing detected",
        };
      return {
        heuristic: "flag",
        evidence: phrasingIssues
          .map((i) => `- [${i.section}] "${i.phrase}" → ${i.details}`)
          .join("\n"),
      };
    },
  },
  {
    id: "americanisms-meanings",
    description:
      "Words with different US/UK meanings (these need human review)",
    fn: ({ americanismsBySection, finalDocument }) => {
      const meaningIssues = americanismsBySection.flatMap(
        ({ section, issues }) =>
          issues
            .filter((i) => i.issue === AMERICANISM_ISSUE_KIND.MEANING)
            .map((i) => ({ section, ...i })),
      );

      const byPhrase = collectMeaningOccurrences(meaningIssues, finalDocument);
      if (byPhrase.size === 0)
        return {
          heuristic: "pass",
          evidence: "No different-meaning words detected",
        };
      return {
        heuristic: "flag",
        evidence: formatMeaningEvidence(byPhrase),
      };
    },
  },
  {
    id: "quiz-question-count",
    description: "Quiz question counts and content",
    fn: ({ finalDocument }) => {
      const lines: string[] = [];
      let anyLow = false;
      for (const key of ["starterQuiz", "exitQuiz"] as const) {
        const quiz = finalDocument[key];
        if (!quiz) {
          lines.push(`${key}: not present`);
          continue;
        }
        const count = quiz.questions?.length ?? 0;
        if (count < 3) anyLow = true;
        lines.push(`${key}: ${count} questions`);
        for (const [qi, q] of (quiz.questions ?? []).entries()) {
          lines.push(`  Q${qi + 1} (${q.questionType}): ${q.question}`);
        }
      }
      return {
        heuristic: anyLow ? "flag" : "pass",
        evidence: lines.join("\n"),
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const SCENARIOS: Record<string, ScenarioConfig> = {
  "full-lesson": {
    name: "full-lesson",
    initialDocument: {
      title: "Introduction to Fractions",
      subject: "Maths",
      keyStage: "ks2",
    },
    userMessage: "Create a lesson about fractions for year 4 pupils",
    fetchRelevantLessons: () => Promise.resolve([]),
  },
  "no-rag-lesson": {
    name: "no-rag-lesson",
    initialDocument: {
      title: "Angle bisectors and perpendicular bisectors",
      subject: "Maths",
      keyStage: "ks4",
    },
    userMessage:
      "Create a lesson about angle bisectors and perpendicular bisectors",
    fetchRelevantLessons: () => Promise.resolve([]),
  },
};

// ---------------------------------------------------------------------------
// Run infrastructure
// ---------------------------------------------------------------------------

const SCORE_RUNS = parseInt(process.env.SCORE_RUNS ?? "3", 10);
const MAX_TURNS = 15;
const OUTPUT_FILE = path.join(__dirname, "scores.yaml");

function computeCodeHash(): string {
  const script = path.join(__dirname, "compute-code-hash.sh");
  return execSync(`bash "${script}"`, { encoding: "utf-8" }).trim();
}

const isComplete = (doc: PartialLessonPlan) =>
  CompletedLessonPlanSchema.safeParse(doc).success;

async function runOnce(scenario: ScenarioConfig): Promise<RunCapture> {
  const openai = new OpenAI();
  const runtime: AilaRuntimeContext = {
    config: { mathsQuizEnabled: false },
    plannerAgent: createOpenAIPlannerAgent(openai),
    sectionAgents: createSectionAgentRegistry({
      openai,
      customAgentHandlers: {
        "starterQuiz--maths": () =>
          Promise.resolve({
            error: { message: "Maths quiz disabled for scoring" },
          }),
        "exitQuiz--maths": () =>
          Promise.resolve({
            error: { message: "Maths quiz disabled for scoring" },
          }),
      },
    }),
    messageToUserAgent: createOpenAIMessageToUserAgent(openai),
    fetchRelevantLessons: scenario.fetchRelevantLessons,
  };

  const plannerOutputs: PlannerOutput[] = [];
  const allPatches: JsonPatchOperation[] = [];
  let finalDocument: PartialLessonPlan = {};
  let finalMessage = "";

  const messages: ChatMessage[] = [
    { id: "m0", role: "user", content: scenario.userMessage },
  ];
  const persisted: AilaPersistedState = {
    messages,
    initialDocument: { ...scenario.initialDocument },
    relevantLessons: null,
  };

  const startTime = Date.now();
  let turnCount = 0;

  try {
    while (turnCount < MAX_TURNS) {
      let turnDoc: PartialLessonPlan | null = null;
      let turnMessage = "";
      const turnPatches: JsonPatchOperation[] = [];
      let turnPlannerSections: SectionKey[] = [];

      const callbacks: AilaTurnCallbacks = {
        onPlannerComplete: ({ sectionKeys }) => {
          turnPlannerSections = sectionKeys;
        },
        onSectionComplete: (patches) => {
          turnPatches.push(...patches);
        },
        onTurnComplete: ({ document, ailaMessage }) => {
          turnDoc = document;
          turnMessage = ailaMessage;
          return Promise.resolve();
        },
        onTurnFailed: ({ ailaMessage }) => {
          turnMessage = ailaMessage;
          return Promise.resolve();
        },
      };

      await ailaTurn({ persistedState: persisted, runtime, callbacks });
      turnCount++;

      // Record the planner output as a synthetic PlannerOutput for scoring.
      // We only have section keys from the callback, so reconstruct a plan.
      if (turnPlannerSections.length > 0) {
        const steps: PlanStep[] = turnPlannerSections.map((sk) => ({
          type: "section" as const,
          sectionKey: sk,
          action: "generate" as const,
          sectionInstructions: null,
        }));
        plannerOutputs.push({
          decision: "plan" as const,
          parsedUserMessage: "",
          plan: steps,
        });
      }

      allPatches.push(...turnPatches);

      if (turnDoc) {
        finalDocument = turnDoc;
        finalMessage = turnMessage;
        persisted.initialDocument = turnDoc;

        persisted.messages.push({
          id: `a${turnCount}`,
          role: "assistant",
          content: turnMessage,
        });

        if (isComplete(turnDoc)) break;

        persisted.messages.push({
          id: `u${turnCount}`,
          role: "user",
          content: "continue",
        });
      } else {
        break;
      }
    }
  } catch (error) {
    const durationSec = (Date.now() - startTime) / 1000;
    return {
      plannerOutputs,
      finalDocument,
      allPatches,
      finalMessage,
      turnCount,
      americanismsBySection: new AilaAmericanisms().findAmericanisms(
        finalDocument,
      ),
      error: String(error),
      durationSec,
    };
  }

  return {
    plannerOutputs,
    finalDocument,
    allPatches,
    finalMessage,
    turnCount,
    americanismsBySection: new AilaAmericanisms().findAmericanisms(
      finalDocument,
    ),
    durationSec: (Date.now() - startTime) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Scoring & reporting
// ---------------------------------------------------------------------------

type RunScore = { scorerId: string; description: string; result: ScorerResult };

type ScenarioResults = {
  scenarioName: string;
  runs: Array<{
    runIndex: number;
    durationSec: number;
    turnCount: number;
    error?: string;
    complete: boolean;
    scores: RunScore[];
  }>;
};

function scoreRun(capture: RunCapture, scenarioName: string): RunScore[] {
  return SCORERS.filter(
    (s) => !s.scenarios || s.scenarios.includes(scenarioName),
  ).map((scorer) => {
    if (capture.error) {
      return {
        scorerId: scorer.id,
        description: scorer.description,
        result: {
          heuristic: "flag" as const,
          evidence: `Run error: ${capture.error}`,
        },
      };
    }
    try {
      return {
        scorerId: scorer.id,
        description: scorer.description,
        result: scorer.fn(capture),
      };
    } catch (e) {
      return {
        scorerId: scorer.id,
        description: scorer.description,
        result: {
          heuristic: "flag" as const,
          evidence: `Scorer error: ${String(e)}`,
        },
      };
    }
  });
}

function generateReport(allResults: ScenarioResults[]): string {
  const lines: string[] = [];
  lines.push("# Agentic Issue Scoring Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Runs per scenario: ${SCORE_RUNS}`);
  lines.push("");
  lines.push(
    "> This report extracts relevant content per AG issue across multiple runs.",
  );
  lines.push(
    "> Heuristic flags (🚩) are quick programmatic checks — review the evidence to decide.",
  );
  lines.push("");

  for (const scenario of allResults) {
    lines.push("---");
    lines.push(`## ${scenario.scenarioName} (${scenario.runs.length} runs)`);
    lines.push("");

    // Heuristic summary table
    const scorerIds = [
      ...new Set(scenario.runs.flatMap((r) => r.scores.map((s) => s.scorerId))),
    ];
    lines.push("### Heuristic summary");
    lines.push("");
    lines.push(
      `| Issue | ${scenario.runs.map((_, i) => `Run ${i + 1}`).join(" | ")} |`,
    );
    lines.push(`|-------|${scenario.runs.map(() => "--------").join("|")}|`);
    for (const sid of scorerIds) {
      const cells = scenario.runs.map((run) => {
        const s = run.scores.find((sc) => sc.scorerId === sid);
        if (!s) return "—";
        if (s.result.heuristic === "pass") return "✓";
        if (s.result.heuristic === "skip") return "—";
        return "🚩";
      });
      lines.push(`| ${sid} | ${cells.join(" | ")} |`);
    }
    lines.push("");

    // Per-run evidence
    for (const run of scenario.runs) {
      const status = run.error
        ? "ERROR"
        : run.complete
          ? "complete"
          : "incomplete";
      lines.push(
        `### Run ${run.runIndex + 1} — ${run.turnCount} turns, ${run.durationSec.toFixed(1)}s, ${status}`,
      );
      lines.push("");

      for (const { scorerId, description, result } of run.scores) {
        if (result.heuristic === "skip") continue;
        const icon = result.heuristic === "pass" ? "✓" : "🚩";
        lines.push(`#### ${icon} ${scorerId}: ${description}`);
        lines.push("");
        lines.push("```");
        lines.push(result.evidence);
        lines.push("```");
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Jest test
// ---------------------------------------------------------------------------

describe("Agentic Issue Scoring", () => {
  const allResults: ScenarioResults[] = [];

  afterAll(() => {
    const report = generateReport(allResults);
    console.log("\n" + report);

    const summary: Record<string, Record<string, Record<string, number>>> = {};
    for (const scenario of allResults) {
      const scorerTotals: Record<string, Record<string, number>> = {};
      for (const run of scenario.runs) {
        for (const { scorerId, result } of run.scores) {
          scorerTotals[scorerId] ??= {};
          const counts = scorerTotals[scorerId];
          counts[result.heuristic] = (counts[result.heuristic] ?? 0) + 1;
        }
      }
      summary[scenario.scenarioName] = scorerTotals;
    }

    const scoresData = {
      codeHash: computeCodeHash(),
      generated: new Date().toISOString(),
      runsPerScenario: SCORE_RUNS,
      summary,
    };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, YAML.stringify(scoresData));
    console.log(`\nScores written to: ${OUTPUT_FILE}`);
  });

  for (const [scenarioKey, scenario] of Object.entries(SCENARIOS)) {
    test(`score ${scenarioKey} (${SCORE_RUNS} runs)`, async () => {
      const scenarioResults: ScenarioResults = {
        scenarioName: scenarioKey,
        runs: [],
      };

      for (let i = 0; i < SCORE_RUNS; i++) {
        console.log(`\n--- ${scenarioKey} run ${i + 1}/${SCORE_RUNS} ---\n`);
        const capture = await runOnce(scenario);
        console.log(
          `    ${capture.turnCount} turns, ${capture.durationSec.toFixed(1)}s${capture.error ? ` ERROR: ${capture.error}` : ""}`,
        );

        const scores = scoreRun(capture, scenarioKey);
        for (const { scorerId, result } of scores) {
          const icon =
            result.heuristic === "pass"
              ? "✓"
              : result.heuristic === "skip"
                ? "—"
                : "🚩";
          console.log(`    ${icon} ${scorerId}`);
        }

        scenarioResults.runs.push({
          runIndex: i,
          durationSec: capture.durationSec,
          turnCount: capture.turnCount,
          error: capture.error,
          complete: isComplete(capture.finalDocument),
          scores,
        });
      }

      allResults.push(scenarioResults);
    });
  }
});
