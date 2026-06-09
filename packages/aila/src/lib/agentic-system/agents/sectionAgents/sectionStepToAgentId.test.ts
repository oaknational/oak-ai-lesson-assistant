import type { QuizAction, SectionStep } from "../../schema";
import { sectionStepToAgentId } from "./sectionStepToAgentId";

const baseProps = {
  config: { mathsQuizEnabled: false },
  document: {},
};

const mathsProps = {
  config: { mathsQuizEnabled: true },
  document: { subject: "maths" },
};

function quizStep(
  sectionKey: "starterQuiz" | "exitQuiz",
  action?: QuizAction,
): SectionStep {
  return {
    type: "section",
    sectionKey,
    action: "generate",
    sectionInstructions: null,
    quizIntent: action ? { action, position: null } : undefined,
  };
}

describe("sectionStepToAgentId", () => {
  describe("non-quiz sections", () => {
    it("routes to the default agent for non-quiz sections", () => {
      const step: SectionStep = {
        type: "section",
        sectionKey: "title",
        action: "generate",
        sectionInstructions: null,
      };
      expect(sectionStepToAgentId(step, baseProps)).toBe("title--default");
    });
  });

  describe("starterQuiz", () => {
    // REMOVE_QUIZ_QUESTION is intentionally excluded: it's handled deterministically
    // by the dispatcher before any agent is invoked, and deriveQuizBuildMode throws
    // on REMOVE inside the agent path.
    it.each([
      "ADD_QUIZ_QUESTION",
      "CHANGE_QUIZ_QUESTION",
      "REGENERATE_QUIZ",
    ] as const)("routes %s to --default for non-maths lessons", (action) => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", action), baseProps),
      ).toBe("starterQuiz--default");
    });

    it("routes a step with no quizIntent to --default", () => {
      expect(sectionStepToAgentId(quizStep("starterQuiz"), baseProps)).toBe(
        "starterQuiz--default",
      );
    });

    it("routes a step with no quizIntent to --maths in a maths lesson", () => {
      expect(sectionStepToAgentId(quizStep("starterQuiz"), mathsProps)).toBe(
        "starterQuiz--maths",
      );
    });

    it.each([
      "ADD_QUIZ_QUESTION",
      "CHANGE_QUIZ_QUESTION",
      "REGENERATE_QUIZ",
    ] as const)("routes %s to --maths in a maths lesson", (action) => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", action), mathsProps),
      ).toBe("starterQuiz--maths");
    });
  });

  describe("exitQuiz", () => {
    it.each([
      "ADD_QUIZ_QUESTION",
      "CHANGE_QUIZ_QUESTION",
      "REGENERATE_QUIZ",
    ] as const)("routes %s to --default for non-maths lessons", (action) => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", action), baseProps),
      ).toBe("exitQuiz--default");
    });

    it.each([
      "ADD_QUIZ_QUESTION",
      "CHANGE_QUIZ_QUESTION",
      "REGENERATE_QUIZ",
    ] as const)("routes %s to --maths in a maths lesson", (action) => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", action), mathsProps),
      ).toBe("exitQuiz--maths");
    });
  });
});
