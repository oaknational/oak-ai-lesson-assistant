/**
 * Test script for quiz composer performance analysis
 *
 * Run with:
 *   pnpm --filter @oakai/aila exec tsx src/core/quiz/scripts/test-quiz-composer.ts
 *
 * Requires:
 *   - OPENAI_API_KEY in environment
 *   - Optional: HELICONE_API_KEY for logging
 */
import { aiLogger } from "@oakai/logger";

import type { PartialLessonPlan, QuizPath } from "../../../protocol/schema";
import { buildQuizService } from "../fullservices/buildQuizService";
import {
  type ReportNode,
  type RootReportNode,
  createQuizTracker,
} from "../reporting";

const log = aiLogger("aila:quiz");

const TEST_LESSON_PLAN: PartialLessonPlan = {
  title: "Circle theorems",
  subject: "maths",
  keyStage: "key-stage-4",
  topic: "Circle theorems",
  learningOutcome:
    "I can apply circle theorems to solve problems involving angles in circles.",
  priorKnowledge: [
    "I can identify and name parts of a circle including radius, diameter, chord, tangent, and arc.",
    "I can calculate angles in triangles and quadrilaterals.",
    "I understand that angles on a straight line sum to 180°.",
  ],
  keyLearningPoints: [
    "The angle at the centre is twice the angle at the circumference.",
    "Angles in the same segment are equal.",
    "The angle in a semicircle is 90°.",
    "Opposite angles of a cyclic quadrilateral sum to 180°.",
  ],
};

async function runTest() {
  const quizType: QuizPath = "/starterQuiz";

  console.log("Starting quiz composer test");
  console.log("Lesson:", TEST_LESSON_PLAN.title);
  console.log("Quiz type:", quizType);

  const quizService = buildQuizService({
    sources: ["similarLessons", "multiQuerySemantic"],
    enrichers: ["imageDescriptions"],
    composer: "llm",
  });

  const tracker = createQuizTracker({
    onUpdate: (snapshot) => {
      log.info(`[update] Status: ${snapshot.status}`);
    },
  });

  const startTime = Date.now();

  try {
    const quiz = await tracker.run((task, reportId) =>
      quizService.buildQuiz(
        quizType,
        TEST_LESSON_PLAN,
        [], // no similar lessons pre-fetched
        task,
        reportId,
        null, // no user instructions
      ),
    );

    const totalTime = Date.now() - startTime;
    const report = tracker.getReport();

    console.log("\n=== RESULTS ===");
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Questions selected: ${quiz.questions.length}`);

    quiz.questions.forEach((q, i) => {
      console.log(
        `  ${i + 1}. [${q.questionType}] ${q.question.slice(0, 60)}...`,
      );
    });

    console.log("\n=== REPORT TREE ===");
    printReportTree(report, "", true);

    // Extract composer LLM data specifically
    const composerLlm = findNode(report.children, "composerLlm");
    if (composerLlm?.data) {
      console.log("\n=== COMPOSER LLM DETAILS ===");
      console.log(`Timing: ${String(composerLlm.data.timingMs)}ms`);
      if (composerLlm.data.usage) {
        const usage = composerLlm.data.usage as {
          promptTokens: number;
          completionTokens: number;
          reasoningTokens?: number;
          totalTokens: number;
        };
        console.log(`Prompt tokens: ${usage.promptTokens}`);
        console.log(`Completion tokens: ${usage.completionTokens}`);
        console.log(`Reasoning tokens: ${usage.reasoningTokens ?? "n/a"}`);
        console.log(`Total tokens: ${usage.totalTokens}`);

        if (usage.reasoningTokens !== undefined) {
          const outputTokens = usage.completionTokens - usage.reasoningTokens;
          console.log(`Actual output tokens: ${outputTokens}`);
          console.log(
            `Reasoning overhead: ${((usage.reasoningTokens / usage.completionTokens) * 100).toFixed(1)}%`,
          );
        }
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

function printReportTree(
  node: RootReportNode | ReportNode,
  prefix: string,
  isLast: boolean,
): void {
  const connector = prefix === "" ? "" : isLast ? "└── " : "├── ";
  const name =
    "reportId" in node ? `root (${node.reportId})` : getNodeName(node, prefix);
  const duration = node.durationMs ? ` (${node.durationMs}ms)` : "";
  const status = node.status !== "complete" ? ` [${node.status}]` : "";

  console.log(`${prefix}${connector}${name}${duration}${status}`);

  const children = Object.entries(node.children);
  children.forEach(([childName, child], index) => {
    const newPrefix = prefix + (prefix === "" ? "" : isLast ? "    " : "│   ");
    // Attach name to child for display
    (child as ReportNode & { _name?: string })._name = childName;
    printReportTree(child, newPrefix, index === children.length - 1);
  });
}

function getNodeName(node: ReportNode, _prefix: string): string {
  return (node as ReportNode & { _name?: string })._name ?? "unknown";
}

function findNode(
  children: Record<string, ReportNode> | undefined,
  name: string,
): ReportNode | undefined {
  if (!children) return undefined;

  for (const [key, child] of Object.entries(children)) {
    if (key === name) return child;
    const found = findNode(child.children, name);
    if (found) return found;
  }
  return undefined;
}

runTest().catch(console.error);
