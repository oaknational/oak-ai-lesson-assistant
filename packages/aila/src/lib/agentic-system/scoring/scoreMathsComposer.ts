/* eslint-disable no-console */

/**
 * Maths Composer Eval Harness
 *
 * Calls LLMComposer.compose() directly for each eval cell, N times, and scores
 * structural and content properties of the result.
 *
 * Unlike scorePlannerQuizIntent (which tests classification), this harness
 * exercises the maths composer pathway end-to-end:
 *   - the new `mode` parameter (fullRegen / addOne / rewriteOne)
 *   - the branched prompt fragments (Select ONE additional / replacement; no CURRENT-Q*)
 *   - the branched response schema (min(1).max(1) for single-question modes)
 *
 * Run with:
 *   cd packages/aila && SCORE_RUNS=3 pnpm with-env npx jest \
 *     --testMatch="**\/scoring/scoreMathsComposer.ts" --testTimeout=600000
 *
 * Output: packages/aila/src/lib/agentic-system/scoring/scores-maths-composer.yaml
 */
import fs from "fs";
import path from "path";
import YAML from "yaml";

import { LLMComposer } from "../../../core/quiz/composers/LLMQuizComposer";
import type {
  ComposerResult,
  QuizBuildMode,
  QuizQuestionPool,
  RagQuizQuestion,
} from "../../../core/quiz/interfaces";
import { createMockTask } from "../../../core/quiz/reporting/testing";
import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeRagQuestion = (
  uid: string,
  questionText: string,
  answers: string[],
  distractors: string[],
): RagQuizQuestion => ({
  question: {
    questionType: "multiple-choice",
    question: questionText,
    hint: null,
    answers,
    distractors,
  },
  sourceUid: uid,
  imageMetadata: [],
});

// Three "existing" maths questions — labelled CURRENT-Q* the way the
// composer expects when a quiz is being modified.
const CURRENT_QUIZ_QUESTIONS: RagQuizQuestion[] = [
  makeRagQuestion(
    "CURRENT-Q1",
    "What is 1/2 + 1/4?",
    ["3/4"],
    ["1/6", "2/6", "1/8"],
  ),
  makeRagQuestion(
    "CURRENT-Q2",
    "Simplify 6/8.",
    ["3/4"],
    ["2/3", "4/6", "1/2"],
  ),
  makeRagQuestion(
    "CURRENT-Q3",
    "Which is greater: 1/3 or 2/5?",
    ["2/5"],
    ["1/3", "they are equal", "cannot be compared"],
  ),
];

// Realistic maths candidate questions on adding fractions.
const FRACTION_CANDIDATES: RagQuizQuestion[] = [
  makeRagQuestion(
    "rag-frac-1",
    "What is 2/3 + 1/6?",
    ["5/6"],
    ["3/9", "1/2", "3/6"],
  ),
  makeRagQuestion(
    "rag-frac-2",
    "Find the lowest common denominator of 1/4 and 1/6.",
    ["12"],
    ["10", "24", "8"],
  ),
  makeRagQuestion(
    "rag-frac-3",
    "What is 3/5 + 1/10?",
    ["7/10"],
    ["4/15", "4/10", "1/2"],
  ),
  makeRagQuestion(
    "rag-frac-4",
    "Add 1/2 + 1/3 + 1/6.",
    ["1"],
    ["2/11", "3/11", "5/6"],
  ),
  makeRagQuestion(
    "rag-frac-5",
    "Which method is used to add 1/3 + 1/4?",
    ["Find a common denominator first"],
    [
      "Add the numerators only",
      "Add the denominators only",
      "Multiply the numerators",
    ],
  ),
];

const currentQuizPool: QuizQuestionPool = {
  source: { type: "currentQuiz", quizType: "/starterQuiz" },
  questions: CURRENT_QUIZ_QUESTIONS,
};

const fractionCandidatePool: QuizQuestionPool = {
  source: {
    type: "semanticSearch",
    semanticQuery: "adding fractions with different denominators",
  },
  questions: FRACTION_CANDIDATES,
};

const mathsLessonPlan: PartialLessonPlan = {
  title: "Adding fractions with different denominators",
  subject: "maths",
  keyStage: "key-stage-3",
  topic: "Fractions",
  learningOutcome: "I can add fractions with different denominators",
  priorKnowledge: [
    "Understanding of equivalent fractions",
    "Ability to find common denominators",
    "Basic fraction notation",
  ],
  keyLearningPoints: [
    "To add fractions, they must have the same denominator",
    "Find the lowest common multiple for denominators",
    "Add numerators while keeping the common denominator",
  ],
};

// ---------------------------------------------------------------------------
// Eval cells
// ---------------------------------------------------------------------------

type ExpectedShape = {
  /** Composer must return status: "success" (vs "bail"). */
  status: "success" | "bail";
  /** Required number of selected questions. */
  questionCount?:
    | { exactly: number }
    | { minInclusive: number; maxInclusive: number };
  /** None of the selected question UIDs may start with "CURRENT-Q". */
  excludeCurrentQ?: boolean;
};

type ComposerEvalCell = {
  id: string;
  description: string;
  pools: QuizQuestionPool[];
  lessonPlan: PartialLessonPlan;
  quizType: QuizPath;
  mode: QuizBuildMode;
  userInstructions?: string | null;
  expected: ExpectedShape;
  passThreshold: number;
};

const CELLS: ComposerEvalCell[] = [
  // -------- addOne: pick exactly one non-CURRENT question --------
  {
    id: "addOne-with-candidates",
    description:
      "addOne mode + currentQuiz (3Q) + 5 candidate questions → exactly 1 non-CURRENT question",
    pools: [currentQuizPool, fractionCandidatePool],
    lessonPlan: mathsLessonPlan,
    quizType: "/starterQuiz",
    mode: { kind: "addOne" },
    expected: {
      status: "success",
      questionCount: { exactly: 1 },
      excludeCurrentQ: true,
    },
    passThreshold: 0.95,
  },
  // -------- rewriteOne: replace position 2 with one non-CURRENT question --------
  {
    id: "rewriteOne-pos2",
    description:
      "rewriteOne(2) + currentQuiz (3Q) + 5 candidate questions → exactly 1 non-CURRENT question",
    pools: [currentQuizPool, fractionCandidatePool],
    lessonPlan: mathsLessonPlan,
    quizType: "/starterQuiz",
    mode: { kind: "rewriteOne", position: 2 },
    expected: {
      status: "success",
      questionCount: { exactly: 1 },
      excludeCurrentQ: true,
    },
    passThreshold: 0.95,
  },
  // -------- addOne where the only pool is currentQuiz → composer must bail --------
  // No non-CURRENT candidates exist, so the prompt's "Do not select any UID
  // labelled CURRENT-Q*" makes success impossible.
  {
    id: "addOne-only-current-bails",
    description:
      "addOne mode + only currentQuiz pool (no other candidates) → composer bails",
    pools: [currentQuizPool],
    lessonPlan: mathsLessonPlan,
    quizType: "/starterQuiz",
    mode: { kind: "addOne" },
    expected: {
      status: "bail",
    },
    passThreshold: 0.95,
  },
  // -------- fullRegen on a non-modifying pool → 1-6 questions (existing baseline) --------
  {
    id: "fullRegen-no-current",
    description:
      "fullRegen + only candidate pool (no currentQuiz) → 1-6 questions selected",
    pools: [fractionCandidatePool],
    lessonPlan: mathsLessonPlan,
    quizType: "/starterQuiz",
    mode: { kind: "fullRegen" },
    expected: {
      status: "success",
      questionCount: { minInclusive: 1, maxInclusive: 6 },
    },
    passThreshold: 0.95,
  },
  // -------- fullRegen with currentQuiz present → still 1-6 (modify path) --------
  {
    id: "fullRegen-with-current",
    description:
      "fullRegen + currentQuiz + candidate pool (modify path) → 1-6 questions selected",
    pools: [currentQuizPool, fractionCandidatePool],
    lessonPlan: mathsLessonPlan,
    quizType: "/starterQuiz",
    mode: { kind: "fullRegen" },
    expected: {
      status: "success",
      questionCount: { minInclusive: 1, maxInclusive: 6 },
    },
    passThreshold: 0.95,
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

type CellRun = {
  pass: boolean;
  reasons: string[];
  status: ComposerResult["status"];
  selectedCount: number;
  selectedUids: string[];
  bailReason?: string;
  error?: string;
};

type CellResult = {
  cellId: string;
  description: string;
  passThreshold: number;
  passRate: number;
  runs: CellRun[];
};

function scoreRun(cell: ComposerEvalCell, result: ComposerResult): CellRun {
  const reasons: string[] = [];

  if (result.status !== cell.expected.status) {
    reasons.push(`status: got ${result.status}, want ${cell.expected.status}`);
  }

  // If we expected success, check question shape. If we expected bail, the
  // status mismatch (or match) is the whole signal — no question count to check.
  if (cell.expected.status === "success" && result.status === "success") {
    const count = result.questions.length;
    const c = cell.expected.questionCount;
    if (c && "exactly" in c && count !== c.exactly) {
      reasons.push(`questionCount: got ${count}, want exactly ${c.exactly}`);
    }
    if (
      c &&
      "minInclusive" in c &&
      (count < c.minInclusive || count > c.maxInclusive)
    ) {
      reasons.push(
        `questionCount: got ${count}, want ${c.minInclusive}-${c.maxInclusive}`,
      );
    }

    if (cell.expected.excludeCurrentQ) {
      const currentUids = result.questions
        .map((q) => q.sourceUid)
        .filter((uid) => uid.startsWith("CURRENT-Q"));
      if (currentUids.length > 0) {
        reasons.push(
          `excludeCurrentQ: selected ${currentUids.join(", ")} (must avoid CURRENT-Q*)`,
        );
      }
    }
  }

  const selectedUids =
    result.status === "success" ? result.questions.map((q) => q.sourceUid) : [];

  return {
    pass: reasons.length === 0,
    reasons,
    status: result.status,
    selectedCount: result.status === "success" ? result.questions.length : 0,
    selectedUids,
    ...(result.status === "bail" ? { bailReason: result.bailReason } : {}),
  };
}

async function runCellOnce(cell: ComposerEvalCell): Promise<CellRun> {
  const composer = new LLMComposer();
  // compose() requires a Task for internal child("buildPrompt", ...) and
  // child("llmCall", ...) spans. The eval never reads the resulting Report,
  // so a mock Task that no-ops to Sentry is sufficient.
  const task = createMockTask();
  try {
    const result = await composer.compose(
      cell.pools,
      cell.lessonPlan,
      cell.quizType,
      cell.mode,
      task,
      cell.userInstructions ?? null,
    );
    return scoreRun(cell, result);
  } catch (e) {
    return {
      pass: false,
      reasons: [`compose threw: ${String(e)}`],
      status: "bail",
      selectedCount: 0,
      selectedUids: [],
      error: String(e),
    };
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function generateReport(results: CellResult[], runsPerCell: number): string {
  const lines: string[] = [];
  lines.push("# Maths Composer Eval Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Runs per cell: ${runsPerCell}`);
  lines.push("");
  lines.push("| Cell | Threshold | Pass rate | Status |");
  lines.push("|------|-----------|-----------|--------|");
  for (const r of results) {
    const meets = r.passRate >= r.passThreshold;
    const status = r.passThreshold === 0 ? "📊 baseline" : meets ? "✓" : "🚩";
    lines.push(
      `| ${r.cellId} | ${(r.passThreshold * 100).toFixed(0)}% | ${(r.passRate * 100).toFixed(0)}% | ${status} |`,
    );
  }
  lines.push("");
  for (const r of results) {
    lines.push(`### ${r.cellId} — ${r.description}`);
    lines.push("");
    for (let i = 0; i < r.runs.length; i++) {
      const run = r.runs[i]!;
      const icon = run.pass ? "✓" : "🚩";
      const actual =
        run.status === "success"
          ? `status=success count=${run.selectedCount} uids=[${run.selectedUids.join(", ")}]`
          : `status=bail reason="${run.bailReason ?? ""}"`;
      const reasonStr = run.reasons.length
        ? ` — ${run.reasons.join("; ")}`
        : "";
      lines.push(`- Run ${i + 1} ${icon} ${actual}${reasonStr}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

const OUTPUT_FILE = path.join(__dirname, "scores-maths-composer.yaml");
const SCORE_RUNS = parseInt(process.env.SCORE_RUNS ?? "3", 10);

// ---------------------------------------------------------------------------
// Jest test
// ---------------------------------------------------------------------------

describe("Maths Composer Eval", () => {
  test(`score all cells (${SCORE_RUNS} runs each)`, async () => {
    const results: CellResult[] = [];

    for (const cell of CELLS) {
      console.log(`\n--- ${cell.id} (${SCORE_RUNS} runs) ---`);
      const runs: CellRun[] = [];
      for (let i = 0; i < SCORE_RUNS; i++) {
        const run = await runCellOnce(cell);
        const icon = run.pass ? "✓" : "🚩";
        const actual =
          run.status === "success"
            ? `success count=${run.selectedCount} uids=[${run.selectedUids.join(", ")}]`
            : `bail reason="${run.bailReason ?? run.error ?? ""}"`;
        console.log(`  Run ${i + 1} ${icon} ${actual}`);
        runs.push(run);
      }
      const passCount = runs.filter((r) => r.pass).length;
      const passRate = passCount / runs.length;
      results.push({
        cellId: cell.id,
        description: cell.description,
        passThreshold: cell.passThreshold,
        passRate,
        runs,
      });
    }

    const report = generateReport(results, SCORE_RUNS);
    console.log("\n" + report);

    const yamlData = {
      generated: new Date().toISOString(),
      runsPerCell: SCORE_RUNS,
      cells: results.map((r) => ({
        id: r.cellId,
        description: r.description,
        passThreshold: r.passThreshold,
        passRate: r.passRate,
        runs: r.runs.map((run) => ({
          pass: run.pass,
          reasons: run.reasons,
          status: run.status,
          selectedCount: run.selectedCount,
          selectedUids: run.selectedUids,
          ...(run.bailReason ? { bailReason: run.bailReason } : {}),
          ...(run.error ? { error: run.error } : {}),
        })),
      })),
    };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, YAML.stringify(yamlData));
    console.log(`\nReport written to: ${OUTPUT_FILE}`);
  }, 600_000);
});
