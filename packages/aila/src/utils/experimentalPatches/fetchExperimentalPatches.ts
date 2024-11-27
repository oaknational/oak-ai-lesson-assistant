import type { FullQuizService } from "../../core/quiz/interfaces";
import type {
  ExperimentalPatchDocument,
  MessagePart,
  PatchDocument,
} from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan, Quiz } from "../../protocol/schema";

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
  parsedMessages,
  handlePatch,
  fullQuizService,
}: {
  lessonPlan: LooseLessonPlan;
  parsedMessages: MessagePart[][];
  handlePatch: (patch: ExperimentalPatchDocument) => Promise<void>;
  fullQuizService: FullQuizService;
}) {
  // if (lessonPlan.subject !== "maths") {
  //   // Only maths has experimental patches for now
  //   return;
  // }

  const patches = parsedMessages
    .map((m) => m.map((p) => p.document))
    .flat()
    .filter((p): p is PatchDocument => p.type === "patch");

  const starterQuizPatch = patches.find((p) => p.value.path === "/starterQuiz");

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

  const exitQuizPatch = patches.find((p) => p.value.path === "/exitQuiz");

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
