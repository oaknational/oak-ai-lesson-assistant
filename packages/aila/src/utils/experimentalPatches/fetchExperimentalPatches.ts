import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";
import { aiLogger } from "@oakai/logger";

import type { FullQuizService } from "../../core/quiz/interfaces";
import type {
  ExperimentalPatchDocument,
  PatchDocument,
} from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan, Quiz } from "../../protocol/schema";
import { mathsQuizFixture } from "./mathsQuiz.fixture";

const log = aiLogger("aila:experimental-patches");

/**
 * Wrap a value in an experimental patch 'document'
 */
function preparePatch(
  value: ExperimentalPatchDocument["value"],
): ExperimentalPatchDocument {
  return {
    type: "experimentalPatch",
    value,
  };
}

/**
 * Fetch and enqueue experimental (agentic) additions
 */
export async function fetchExperimentalPatches({
  lessonPlan,
  llmPatches,
  handlePatch,
  fullQuizService,
  userId,
}: {
  lessonPlan: LooseLessonPlan;
  llmPatches: PatchDocument[];
  handlePatch: (patch: ExperimentalPatchDocument) => Promise<void>;
  fullQuizService: FullQuizService;
  userId?: string;
}) {
  if (lessonPlan.subject !== "maths") {
    // Only maths has experimental patches for now
    return;
  }

  if (!userId) {
    log.info("Experimental patches disabled or no user ID. Skipping.");
    return;
  }

  const mathsQuizzesEnabled = await posthogAiBetaServerClient.isFeatureEnabled(
    "maths-quiz-v0",
    userId,
  );

  if (!mathsQuizzesEnabled) {
    log.info("Maths quiz feature-flag disabled. Skipping.");
    return;
  }

  log.info(
    "Maths quiz feature-flag enabled for user. Fetching experimental quiz patches.",
  );

  const starterQuizPatch = llmPatches.find(
    (p) => p.value.path === "/starterQuiz",
  );

  if (starterQuizPatch) {
    const op = starterQuizPatch.value.op;
    if (op === "remove") {
      await handlePatch(
        preparePatch({
          op,
          path: "/_experimental_starterQuizMathsV0",
        }),
      );
    } else {
      // TODO: GCLOMAX - PUT PATCH HERE.
      // TODO: MG - Review this please.
      // Can we put this in here.
      let mathsStarterQuiz: Quiz = await fullQuizService.createBestQuiz(
        "/starterQuiz",
        lessonPlan,
      );
      if (mathsStarterQuiz.length === 0) {
        mathsStarterQuiz = [
          {
            question: "No questions found",
            answers: ["No questions found"],
            distractors: ["No questions found"],
          },
        ];
      }

      if (mathsStarterQuiz) {
        await handlePatch(
          preparePatch({
            path: "/_experimental_starterQuizMathsV0",
            op,
            value: mathsStarterQuiz,
          }),
        );
      }
    }
  }

  const exitQuizPatch = llmPatches.find((p) => p.value.path === "/exitQuiz");

  if (exitQuizPatch) {
    const op = exitQuizPatch.value.op;
    if (op === "remove") {
      await handlePatch(
        preparePatch({
          op,
          path: "/_experimental_exitQuizMathsV0",
        }),
      );
    } else {
      // TODO: GCLOMAX - Once this is deprecated we will need logic to not overwrite the origonal.
      let mathsExitQuiz: Quiz = await fullQuizService.createBestQuiz(
        "/exitQuiz",
        lessonPlan,
      );
      if (mathsExitQuiz.length === 0) {
        mathsExitQuiz = [
          {
            question: "No questions found",
            answers: ["No questions found"],
            distractors: ["No questions found"],
          },
        ];
      }

      if (mathsExitQuiz) {
        await handlePatch(
          preparePatch({
            path: "/_experimental_exitQuizMathsV0",
            op,
            value: mathsExitQuiz,
          }),
        );
      }
    }
  }
}
