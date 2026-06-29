import { preserveMathJaxDelimiters } from "./mathjaxMarkdown";

describe("preserveMathJaxDelimiters", () => {
  it("escapes inline MathJax delimiters for markdown parsing", () => {
    const markdown = String.raw`\( x + \frac{1}{2}x^2 = 40 \)`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      String.raw`\\( x + \frac{1}{2}x^2 = 40 \\)`,
    );
  });

  it("escapes display MathJax delimiters for markdown parsing", () => {
    const markdown = String.raw`\[ x_i + y_j \]`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      String.raw`\\[ x_i + y_j \\]`,
    );
  });

  it("leaves dollar-delimited maths and LaTeX commands unchanged", () => {
    const markdown = String.raw`$$ x + \frac{1}{2}x^2 = 40 $$`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(markdown);
  });

  it("does not double-escape delimiters that are already escaped for markdown", () => {
    const markdown = String.raw`\\( x \\)`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(markdown);
  });

  it("escapes multiple MathJax expressions on the same line", () => {
    const markdown = String.raw`Use \( x \) and \[ y \].`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      String.raw`Use \\( x \\) and \\[ y \\].`,
    );
  });

  it("leaves inline code spans unchanged", () => {
    const markdown = "Use \\(\\) for maths, not `\\(\\)`";

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      "Use \\\\(\\\\) for maths, not `\\(\\)`",
    );
  });

  it("leaves backtick fenced code blocks unchanged", () => {
    const markdown = [
      "Before \\( x \\)",
      "```ts",
      "\\( code \\)",
      "```not-a-closing-fence",
      "\\( more code \\)",
      "```",
      "After \\( y \\)",
    ].join("\n");

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      [
        "Before \\\\( x \\\\)",
        "```ts",
        "\\( code \\)",
        "```not-a-closing-fence",
        "\\( more code \\)",
        "```",
        "After \\\\( y \\\\)",
      ].join("\n"),
    );
  });

  it("leaves tilde fenced code blocks unchanged", () => {
    const markdown = [
      "Before \\( x \\)",
      "~~~",
      "\\[ code \\]",
      "~~~",
      "After \\[ y \\]",
    ].join("\n");

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      [
        "Before \\\\( x \\\\)",
        "~~~",
        "\\[ code \\]",
        "~~~",
        "After \\\\[ y \\\\]",
      ].join("\n"),
    );
  });

  it("leaves plain prose unchanged", () => {
    const markdown = "The answer is 42, not (x + y).";

    expect(preserveMathJaxDelimiters(markdown)).toBe(markdown);
  });

  it("does not escape LaTeX commands like \\left( and \\right) inside math", () => {
    const markdown = String.raw`\( \left(\frac{x}{2}\right) = 1 \)`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      String.raw`\\( \left(\frac{x}{2}\right) = 1 \\)`,
    );
  });

  it("escapes math inside markdown table cells", () => {
    const markdown = String.raw`| Step | \( x = 6 \) |`;

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      String.raw`| Step | \\( x = 6 \\) |`,
    );
  });

  it("leaves inline code spans with no valid close unchanged", () => {
    const markdown = "text `\\( x \\) end`` after";

    expect(preserveMathJaxDelimiters(markdown)).toBe(
      "text `\\\\( x \\\\) end`` after",
    );
  });
});
