import { composeFeedback } from "./feedback";

describe("composeFeedback", () => {
  it("renders a single piece with its type label and no number", () => {
    expect(
      composeFeedback([
        {
          type: "Success criteria",
          content: "at least one change is identified with an explanation.",
        },
      ]),
    ).toBe(
      "Success criteria: at least one change is identified with an explanation.",
    );
  });

  it("numbers multiple pieces to match the statements, one per line", () => {
    expect(
      composeFeedback([
        {
          type: "Completed answer",
          content: "Roman settlement brought more markets.",
        },
        {
          type: "Success criteria",
          content: "at least one change is identified.",
        },
        {
          type: "Model answer",
          content: "In a town, a family pays with coins.",
        },
      ]),
    ).toBe(
      [
        "1. Completed answer: Roman settlement brought more markets.",
        "2. Success criteria: at least one change is identified.",
        "3. Model answer: In a town, a family pays with coins.",
      ].join("\n"),
    );
  });

  it("keeps multi-line content, so calculations stay on separate lines", () => {
    expect(
      composeFeedback([
        { type: "Worked example", content: "4 + 4 = 8\n15 - 6 = 9" },
      ]),
    ).toBe("Worked example: 4 + 4 = 8\n15 - 6 = 9");
  });
});
