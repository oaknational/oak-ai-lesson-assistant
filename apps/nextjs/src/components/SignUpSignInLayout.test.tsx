/**
 * @jest-environment jsdom
 */
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import { render, screen } from "@testing-library/react";

import SignUpSignInLayout from "./SignUpSignInLayout";

// The banner reads bootstrapped feature flags, which this layout test doesn't need
jest.mock("./StatusBanner", () => ({
  StatusBanner: () => null,
}));

// The shared next/image mock returns a plain object, which React 19 won't render
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage({ alt }: { alt: string }) {
    return <img alt={alt} />;
  },
}));

const renderLayout = (loaded: boolean) =>
  render(
    <OakThemeProvider theme={oakDefaultTheme}>
      <SignUpSignInLayout loaded={loaded}>
        <p>First child</p>
        <p>Second child</p>
      </SignUpSignInLayout>
    </OakThemeProvider>,
  );

describe("SignUpSignInLayout", () => {
  // The sign-in page passes more than one child, which a Fragment-based
  // Transition can't forward its ref to
  it("renders multiple children once loaded", () => {
    renderLayout(true);

    expect(screen.getByText("First child")).toBeInTheDocument();
    expect(screen.getByText("Second child")).toBeInTheDocument();
  });

  it("hides the children until loaded", () => {
    renderLayout(false);

    expect(screen.queryByText("First child")).not.toBeInTheDocument();
  });
});
