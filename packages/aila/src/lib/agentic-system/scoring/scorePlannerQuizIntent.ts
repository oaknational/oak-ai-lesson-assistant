/* eslint-disable no-console */

/**
 * Planner Quiz-Intent Eval Harness
 *
 * Calls the planner agent directly for each eval cell, N times, and scores
 * whether `step.quizIntent` matches the expected action/target/position.
 *
 * Covers the eval cells from `docs/superpowers/specs/2026-05-14-quiz-modify-button.md`:
 * marker recognition (hard gate 100%) and prose classification (soft target ≥95%).
 *
 * Run with:
 *   cd packages/aila && SCORE_RUNS=5 pnpm with-env npx jest \
 *     --testMatch="**\/scoring/scorePlannerQuizIntent.ts" --testTimeout=600000
 *
 * Output: packages/aila/src/lib/agentic-system/scoring/scores-planner-quiz-intent.yaml
 */
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import YAML from "yaml";

import type {
  LatestQuiz,
  LatestQuizQuestion,
  PartialLessonPlan,
} from "../../../protocol/schema";
import { createOpenAIPlannerAgent } from "../agents/plannerAgent";
import type { PlannerOutput, QuizIntent } from "../schema";
import type { ChatMessage } from "../types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeQuestion = (text: string): LatestQuizQuestion => ({
  questionType: "multiple-choice",
  question: text,
  hint: null,
  answers: ["Correct"],
  distractors: ["Wrong A", "Wrong B"],
});

// Distinct topics so "the photosynthesis question" maps unambiguously to Q1.
const QUIZ_QUESTIONS: LatestQuizQuestion[] = [
  makeQuestion("What is photosynthesis?"),
  makeQuestion("How many sides does a hexagon have?"),
  makeQuestion("What is the chemical symbol for water?"),
  makeQuestion("Who wrote Romeo and Juliet?"),
  makeQuestion("What is the capital of France?"),
  makeQuestion("What is the largest planet in our solar system?"),
];

const populatedQuiz = (questions: LatestQuizQuestion[]): LatestQuiz => ({
  version: "v3",
  questions,
  imageMetadata: [],
});

const emptyQuiz: LatestQuiz = {
  version: "v3",
  questions: [],
  imageMetadata: [],
};

const baseDoc: PartialLessonPlan = {
  title: "General knowledge mix",
  subject: "Science",
  keyStage: "ks3",
  starterQuiz: populatedQuiz(QUIZ_QUESTIONS),
  exitQuiz: populatedQuiz(QUIZ_QUESTIONS),
};

const baseDocWithEmptyStarter: PartialLessonPlan = {
  ...baseDoc,
  starterQuiz: emptyQuiz,
};

// ---------------------------------------------------------------------------
// Eval cells
// ---------------------------------------------------------------------------

type ExpectedIntent = {
  sectionKey: "starterQuiz" | "exitQuiz";
  action?: QuizIntent["action"];
  position?: number | null;
};

type EvalCell = {
  id: string;
  description: string;
  initialDocument: PartialLessonPlan;
  userMessage: string;
  expected: ExpectedIntent;
  passThreshold: number; // 1.0 = hard gate, 0.95 = soft target, 0 = baseline
};

const CELLS: EvalCell[] = [
  // -------- Prose → action (soft targets) --------
  {
    id: "prose-action-remove",
    description: "Prose 'remove question 3' → REMOVE_QUIZ_QUESTION",
    initialDocument: baseDoc,
    userMessage: "Please remove question 3 from the starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 3,
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-action-add",
    description: "Prose 'add a question about X' → ADD_QUIZ_QUESTION",
    initialDocument: baseDoc,
    userMessage: "Please add a question about volcanoes to the starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "ADD_QUIZ_QUESTION",
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-action-change",
    description: "Prose 'rewrite question 2' → CHANGE_QUIZ_QUESTION",
    initialDocument: baseDoc,
    userMessage: "Please rewrite question 2 in the starter quiz to be easier",
    expected: {
      sectionKey: "starterQuiz",
      action: "CHANGE_QUIZ_QUESTION",
      position: 2,
    },
    passThreshold: 0.95,
  },
  // -------- Prose → position resolution --------
  {
    id: "prose-position-ordinal-first",
    description: "Prose 'the first question' → position 1",
    initialDocument: baseDoc,
    userMessage: "Remove the first question from the starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 1,
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-position-ordinal-last",
    description: "Prose 'the last question' → position = length (6)",
    initialDocument: baseDoc,
    userMessage: "Remove the last question from the starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 6,
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-position-content-ref",
    description: "Prose 'the photosynthesis question' → position 1 (baseline)",
    initialDocument: baseDoc,
    userMessage: "Remove the photosynthesis question from the starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 1,
    },
    passThreshold: 0, // baseline only
  },
  // -------- Empty-quiz add → regenerate (ADR-0001 'no silent fallback') --------
  {
    id: "prose-empty-quiz-add-regenerate",
    description:
      "ADD on empty starter quiz → REGENERATE_QUIZ (empty-quiz exception)",
    initialDocument: baseDocWithEmptyStarter,
    userMessage: "For the starter quiz, add a question",
    expected: {
      sectionKey: "starterQuiz",
      action: "REGENERATE_QUIZ",
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-button-remove",
    description:
      "Button Remove + textarea '3' → buildProse-shape prose, no marker",
    initialDocument: baseDoc,
    userMessage: "For the starter quiz, remove question: 3",
    expected: {
      sectionKey: "starterQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 3,
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-button-add",
    description:
      "Button Add + textarea 'about prime numbers' → buildProse-shape prose, no marker",
    initialDocument: baseDoc,
    userMessage: "For the starter quiz, add a question: about prime numbers",
    expected: {
      sectionKey: "starterQuiz",
      action: "ADD_QUIZ_QUESTION",
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-button-change",
    description:
      "Button Change + textarea 'make question 2 easier' → buildProse-shape prose",
    initialDocument: baseDoc,
    userMessage:
      "For the starter quiz, change question: make question 2 easier",
    expected: {
      sectionKey: "starterQuiz",
      action: "CHANGE_QUIZ_QUESTION",
      position: 2,
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-button-regenerate",
    description:
      "Button Generate-new (no textarea) → buildProse-shape prose, no marker",
    initialDocument: baseDoc,
    userMessage: "Generate a new starter quiz",
    expected: {
      sectionKey: "starterQuiz",
      action: "REGENERATE_QUIZ",
    },
    passThreshold: 0.95,
  },
  {
    id: "prose-button-target-exit",
    description:
      "Button Remove on exit quiz + textarea '4' → buildProse-shape prose, no marker",
    initialDocument: baseDoc,
    userMessage: "For the exit quiz, remove question: 4",
    expected: {
      sectionKey: "exitQuiz",
      action: "REMOVE_QUIZ_QUESTION",
      position: 4,
    },
    passThreshold: 0.95,
  },
];

// ---------------------------------------------------------------------------
// Run + scoring
// ---------------------------------------------------------------------------

type CellRun = {
  pass: boolean;
  reasons: string[];
  decision: PlannerOutput["decision"];
  actual: {
    action?: QuizIntent["action"];
    position?: number | null;
  } | null;
  error?: string;
};

type CellResult = {
  cellId: string;
  description: string;
  passThreshold: number;
  passRate: number;
  runs: CellRun[];
};

function findQuizStep(
  planner: PlannerOutput,
  sectionKey: "starterQuiz" | "exitQuiz",
) {
  if (planner.decision !== "plan") return null;
  return planner.plan.find((s) => s.sectionKey === sectionKey) ?? null;
}

function scoreOneRun(
  cell: EvalCell,
  planner: PlannerOutput | null,
  error?: string,
): CellRun {
  if (error || !planner) {
    return {
      pass: false,
      reasons: [`run error: ${error ?? "no planner output"}`],
      decision: planner?.decision ?? "exit",
      actual: null,
      error,
    };
  }
  if (planner.decision !== "plan") {
    return {
      pass: false,
      reasons: [`planner exited (reason: ${planner.reasonType})`],
      decision: planner.decision,
      actual: null,
    };
  }
  const step = findQuizStep(planner, cell.expected.sectionKey);
  if (!step) {
    return {
      pass: false,
      reasons: [`no plan step for ${cell.expected.sectionKey}`],
      decision: planner.decision,
      actual: null,
    };
  }
  const intent = step.quizIntent;
  if (!intent) {
    return {
      pass: false,
      reasons: ["step.quizIntent absent"],
      decision: planner.decision,
      actual: null,
    };
  }

  const reasons: string[] = [];
  if (cell.expected.action && intent.action !== cell.expected.action) {
    reasons.push(`action: got ${intent.action}, want ${cell.expected.action}`);
  }
  if (
    Object.prototype.hasOwnProperty.call(cell.expected, "position") &&
    intent.position !== cell.expected.position
  ) {
    reasons.push(
      `position: got ${intent.position}, want ${cell.expected.position}`,
    );
  }

  return {
    pass: reasons.length === 0,
    reasons,
    decision: planner.decision,
    actual: {
      action: intent.action,
      position: intent.position,
    },
  };
}

async function runCellOnce(cell: EvalCell, openai: OpenAI): Promise<CellRun> {
  const planner = createOpenAIPlannerAgent(openai);
  const messages: ChatMessage[] = [
    { id: "u1", role: "user", content: cell.userMessage },
  ];
  try {
    const result = await planner({
      messages,
      document: cell.initialDocument,
      relevantLessons: null,
    });
    if (result.error) {
      return scoreOneRun(cell, null, result.error.message);
    }
    return scoreOneRun(cell, result.data);
  } catch (e) {
    return scoreOneRun(cell, null, String(e));
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function generateReport(results: CellResult[], runsPerCell: number): string {
  const lines: string[] = [];
  lines.push("# Planner Quiz-Intent Eval Report");
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
      const actual = run.actual
        ? `action=${run.actual.action} position=${run.actual.position}`
        : run.error
          ? `error=${run.error}`
          : `decision=${run.decision}`;
      const reasonStr = run.reasons.length
        ? ` — ${run.reasons.join("; ")}`
        : "";
      lines.push(`- Run ${i + 1} ${icon} ${actual}${reasonStr}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

const OUTPUT_FILE = path.join(__dirname, "scores-planner-quiz-intent.yaml");
const SCORE_RUNS = parseInt(process.env.SCORE_RUNS ?? "5", 10);

// ---------------------------------------------------------------------------
// Jest test
// ---------------------------------------------------------------------------

describe("Planner Quiz-Intent Eval", () => {
  test(`score all cells (${SCORE_RUNS} runs each)`, async () => {
    const openai = new OpenAI();
    const results: CellResult[] = [];

    for (const cell of CELLS) {
      console.log(`\n--- ${cell.id} (${SCORE_RUNS} runs) ---`);
      const runs: CellRun[] = [];
      for (let i = 0; i < SCORE_RUNS; i++) {
        const run = await runCellOnce(cell, openai);
        const icon = run.pass ? "✓" : "🚩";
        const actual = run.actual
          ? `${run.actual.action} pos=${run.actual.position}`
          : run.error
            ? `error: ${run.error}`
            : `decision: ${run.decision}`;
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
          actual: run.actual,
          ...(run.error ? { error: run.error } : {}),
        })),
      })),
    };
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, YAML.stringify(yamlData));
    console.log(`\nReport written to: ${OUTPUT_FILE}`);
  }, 600_000);
});
