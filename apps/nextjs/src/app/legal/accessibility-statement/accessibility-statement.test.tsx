/**
 * @jest-environment jsdom
 */
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import { render, screen } from "@testing-library/react";

import type { PolicyDocument } from "@/cms/types/policyDocument";

import { AccessibilityStatementContent } from "./accessibility-statement";
import { accessibilityStatementFixture } from "./accessibility-statement.story.fixture";

// Layout imports Clerk, which jest can't parse, and the content doesn't use it.
jest.mock("@/components/Layout", () => ({
  __esModule: true,
  default: () => null,
}));

const { pageData } = accessibilityStatementFixture;

const renderStatement = (data: PolicyDocument = pageData) =>
  render(
    <OakThemeProvider theme={oakDefaultTheme}>
      <AccessibilityStatementContent pageData={data} />
    </OakThemeProvider>,
  );

describe("AccessibilityStatementContent", () => {
  it("renders the title as the only level 1 heading", () => {
    renderStatement();

    const titles = screen.getAllByRole("heading", { level: 1 });
    expect(titles).toHaveLength(1);
    expect(titles[0]).toHaveTextContent("Accessibility Statement");
  });

  it.each([
    { style: "heading2", level: 2, name: "Introduction" },
    { style: "heading3", level: 3, name: "Compliance status" },
    {
      style: "heading4",
      level: 4,
      name: "Non-compliance with the accessibility regulations",
    },
    {
      style: "heading5",
      level: 5,
      name: "Navigation and accessing information",
    },
  ])("renders $style blocks as level $level headings", ({ level, name }) => {
    renderStatement();

    expect(screen.getByRole("heading", { level, name })).toBeInTheDocument();
  });

  it("renders heading1 blocks as level 2 headings", () => {
    renderStatement({
      ...pageData,
      body: [
        {
          _type: "block",
          _key: "b1",
          style: "heading1",
          markDefs: [],
          children: [
            { _type: "span", _key: "b1a", marks: [], text: "Top section" },
          ],
        },
      ],
    });

    expect(
      screen.getByRole("heading", { level: 2, name: "Top section" }),
    ).toBeInTheDocument();
  });
});
