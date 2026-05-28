import { buildQuizMessage } from "./buildQuizMessage";

describe("buildQuizMessage", () => {
  it("builds a Remove-question message including the section label and details", () => {
    const message = buildQuizMessage({
      sectionLabel: "starter quiz",
      details: "3",
      optionLabel: "Remove question",
    });
    expect(message).toBe("For the starter quiz, remove question: 3");
  });

  it("builds an Add-question message with the user's topic in the details", () => {
    const message = buildQuizMessage({
      sectionLabel: "exit quiz",
      details: "about fractions",
      optionLabel: "Add question",
    });
    expect(message).toBe("For the exit quiz, add a question: about fractions");
  });

  it("builds a Change-question message", () => {
    const message = buildQuizMessage({
      sectionLabel: "starter quiz",
      details: "make question 2 easier",
      optionLabel: "Change question",
    });
    expect(message).toBe(
      "For the starter quiz, change question: make question 2 easier",
    );
  });

  it("builds a Generate-new message without a colon when details are empty", () => {
    const message = buildQuizMessage({
      sectionLabel: "starter quiz",
      details: "",
      optionLabel: "Generate a new quiz",
    });
    expect(message).toBe("Generate a new starter quiz");
  });

  it("omits the colon-prefixed detail when details are empty", () => {
    const message = buildQuizMessage({
      sectionLabel: "starter quiz",
      details: "",
      optionLabel: "Remove question",
    });
    expect(message).toBe("For the starter quiz, remove question");
  });
});
