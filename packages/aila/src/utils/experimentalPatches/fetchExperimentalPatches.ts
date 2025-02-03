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
      let mathsStarterQuiz: Quiz = await fullQuizService.createBestQuiz(
        "/starterQuiz",
        lessonPlan,
      );
      if (mathsStarterQuiz.length === 0) {
        log.info("No starter quiz found. Creating placeholder starter quiz.");
        mathsStarterQuiz = [
          {
            question: "No questions found",
            answers: [
              "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
            ],
            distractors: [
              "Why am i seeing this? If you do not believe you should be trialling this system please provide feedback using the flag button and selecting other. Please use this for any other feedback on the recommended quiz with the title **Experimental Quiz**",
            ],
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
        log.info("No exit quiz found. Creating placeholder exit quiz.");
        mathsExitQuiz = [
          {
            question: "No questions found",
            answers: [
              "No questions found: The recommendation system you are trialling does not have suitable questions with the basedOn recommendation path. You are seeing this in place of an LLM generated quiz to make it clear that the recommendation system does not have suitable questions",
            ],
            distractors: [
              "Why am i seeing this? If you do not believe you should be trialling this system please provide feedback using the flag button and selecting other. Please use this for any other feedback on the recommended quiz with the title **Experimental Quiz**",
            ],
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
