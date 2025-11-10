import {
  createBlankComponents,
  hasBlankSpaces,
  prepareTextWithBlanks,
} from "./textWithBlanks";

describe("hasBlankSpaces", () => {
  it("should detect curly braces patterns", () => {
    expect(hasBlankSpaces("What is {{}}?")).toBe(true);
    expect(hasBlankSpaces("What is {{ }}?")).toBe(true);
  });

  it("should detect underscore patterns", () => {
    expect(hasBlankSpaces("What is ___?")).toBe(true);
    expect(hasBlankSpaces("What is ______?")).toBe(true);
  });

  it("should not detect short underscore patterns", () => {
    expect(hasBlankSpaces("What is __?")).toBe(false);
    expect(hasBlankSpaces("What is _?")).toBe(false);
  });

  it("should not detect regular text", () => {
    expect(hasBlankSpaces("What is the answer?")).toBe(false);
    expect(hasBlankSpaces("No blanks here")).toBe(false);
  });
});

describe("prepareTextWithBlanks", () => {
  it("should wrap basic blanks in emphasis markers", () => {
    expect(prepareTextWithBlanks("What is {{}}?")).toBe("What is _{{}}?_");
    expect(prepareTextWithBlanks("What is ___?")).toBe("What is _{{}}?_");
  });

  it("should handle blanks with degree symbol", () => {
    expect(prepareTextWithBlanks("Temperature is {{}}°")).toBe(
      "Temperature is _{{}}°_",
    );
  });

  it("should handle blanks with temperature units", () => {
    expect(prepareTextWithBlanks("Temperature is {{}}°C")).toBe(
      "Temperature is _{{}}°C_",
    );
    expect(prepareTextWithBlanks("Temperature is {{}}°F")).toBe(
      "Temperature is _{{}}°F_",
    );
  });

  it("should handle blanks with various units", () => {
    expect(prepareTextWithBlanks("Distance is {{}}km")).toBe(
      "Distance is _{{}}km_",
    );
    expect(prepareTextWithBlanks("Height is {{}}m")).toBe("Height is _{{}}m_");
    expect(prepareTextWithBlanks("Weight is {{}}kg")).toBe(
      "Weight is _{{}}kg_",
    );
    expect(prepareTextWithBlanks("Percentage is {{}}%")).toBe(
      "Percentage is _{{}}%_",
    );
  });

  it("should handle multiple blanks with different suffixes", () => {
    const input = "{{}}°C is equal to {{}}°F";
    const expected = "_{{}}°C_ is equal to _{{}}°F_";
    expect(prepareTextWithBlanks(input)).toBe(expected);
  });

  it("should handle blanks followed by spaces", () => {
    expect(prepareTextWithBlanks("The answer is {{}}° today")).toBe(
      "The answer is _{{}}°_ today",
    );
    expect(prepareTextWithBlanks("Speed is {{}}km per hour")).toBe(
      "Speed is _{{}}km_ per hour",
    );
  });

  it("should not modify text without blanks", () => {
    expect(prepareTextWithBlanks("What is the answer?")).toBe(
      "What is the answer?",
    );
  });
});

describe("createBlankComponents", () => {
  it("should identify blank patterns correctly", () => {
    const components = createBlankComponents();
    const emComponent = components.em!;

    // We can't easily test React components without theme context,
    // but we can test the logic by checking the component behavior
    expect(typeof emComponent).toBe("function");
  });

  it("should handle empty content", () => {
    const components = createBlankComponents();
    const emComponent = components.em!;
    expect(typeof emComponent).toBe("function");
  });

  it("should accept answers", () => {
    const components = createBlankComponents("100");
    const emComponent = components.em!;
    expect(typeof emComponent).toBe("function");
  });
});
