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
    it("routes ADD_QUIZ_QUESTION to --addOne", () => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "ADD_QUIZ_QUESTION"), baseProps),
      ).toBe("starterQuiz--addOne");
    });

    it("routes CHANGE_QUIZ_QUESTION to --rewriteOne", () => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "CHANGE_QUIZ_QUESTION"), baseProps),
      ).toBe("starterQuiz--rewriteOne");
    });

    it("routes REGENERATE_QUIZ to --default in a non-maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "REGENERATE_QUIZ"), baseProps),
      ).toBe("starterQuiz--default");
    });

    it("routes REGENERATE_QUIZ to --maths in a maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "REGENERATE_QUIZ"), mathsProps),
      ).toBe("starterQuiz--maths");
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

    it("routes ADD_QUIZ_QUESTION to --maths in a maths lesson", () => {
      // The --maths handler is mode-aware and derives addOne / rewriteOne / fullRegen
      // from currentStep.quizIntent.action at the handler boundary.
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "ADD_QUIZ_QUESTION"), mathsProps),
      ).toBe("starterQuiz--maths");
    });

    it("routes CHANGE_QUIZ_QUESTION to --maths in a maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("starterQuiz", "CHANGE_QUIZ_QUESTION"), mathsProps),
      ).toBe("starterQuiz--maths");
    });
  });

  describe("exitQuiz", () => {
    it("routes ADD_QUIZ_QUESTION to --addOne", () => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", "ADD_QUIZ_QUESTION"), baseProps),
      ).toBe("exitQuiz--addOne");
    });

    it("routes CHANGE_QUIZ_QUESTION to --rewriteOne", () => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", "CHANGE_QUIZ_QUESTION"), baseProps),
      ).toBe("exitQuiz--rewriteOne");
    });

    it("routes REGENERATE_QUIZ to --maths in a maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", "REGENERATE_QUIZ"), mathsProps),
      ).toBe("exitQuiz--maths");
    });

    it("routes ADD_QUIZ_QUESTION to --maths in a maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", "ADD_QUIZ_QUESTION"), mathsProps),
      ).toBe("exitQuiz--maths");
    });

    it("routes CHANGE_QUIZ_QUESTION to --maths in a maths lesson", () => {
      expect(
        sectionStepToAgentId(quizStep("exitQuiz", "CHANGE_QUIZ_QUESTION"), mathsProps),
      ).toBe("exitQuiz--maths");
    });
  });
});
