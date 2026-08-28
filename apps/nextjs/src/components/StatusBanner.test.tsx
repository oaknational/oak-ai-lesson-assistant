/**
 * @jest-environment jsdom
 */
import { OakThemeProvider, oakDefaultTheme } from "@oaknational/oak-components";
import { render, screen } from "@testing-library/react";

import {
  useBootstrappedFeatureFlag,
  useBootstrappedPayload,
} from "@/components/ContextProviders/FeatureFlagProvider";
import { DEFAULT_STATUS_BANNER_PAYLOAD } from "@/lib/feature-flags/statusBanner";

import { StatusBanner } from "./StatusBanner";

jest.mock("@/components/ContextProviders/FeatureFlagProvider", () => ({
  useBootstrappedFeatureFlag: jest.fn(),
  useBootstrappedPayload: jest.fn(),
}));

const mockFlag = jest.mocked(useBootstrappedFeatureFlag);
const mockPayload = jest.mocked(useBootstrappedPayload);

const renderBanner = () =>
  render(
    <OakThemeProvider theme={oakDefaultTheme}>
      <StatusBanner />
    </OakThemeProvider>,
  );

describe("StatusBanner", () => {
  it("renders nothing when the flag is off", () => {
    mockFlag.mockReturnValue(false);
    mockPayload.mockReturnValue(undefined);

    renderBanner();

    expect(screen.queryByTestId("status-banner")).not.toBeInTheDocument();
  });

  it("renders the payload message and link when the flag is on", () => {
    mockFlag.mockReturnValue(true);
    mockPayload.mockReturnValue({
      messageBefore: "Aila is having problems, check",
      linkText: "the status page",
      href: "https://status.thenational.academy/",
      messageAfter: "for updates.",
    });

    renderBanner();

    expect(screen.getByTestId("status-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/Aila is having problems, check/),
    ).toBeInTheDocument();
    expect(screen.getByText(/for updates\./)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "the status page" });
    expect(link).toHaveAttribute("href", "https://status.thenational.academy/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("falls back to the default message when the flag has no payload", () => {
    mockFlag.mockReturnValue(true);
    mockPayload.mockReturnValue(undefined);

    renderBanner();

    expect(
      screen.getByText(new RegExp(DEFAULT_STATUS_BANNER_PAYLOAD.messageBefore)),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: DEFAULT_STATUS_BANNER_PAYLOAD.linkText,
      }),
    ).toHaveAttribute("href", DEFAULT_STATUS_BANNER_PAYLOAD.href);
  });

  it("falls back to the default message when the payload is malformed", () => {
    mockFlag.mockReturnValue(true);
    mockPayload.mockReturnValue({ linkText: 42 });

    expect(() => renderBanner()).not.toThrow();

    expect(
      screen.getByRole("link", {
        name: DEFAULT_STATUS_BANNER_PAYLOAD.linkText,
      }),
    ).toBeInTheDocument();
  });

  it("announces itself politely without claiming the banner landmark", () => {
    mockFlag.mockReturnValue(true);
    mockPayload.mockReturnValue(undefined);

    renderBanner();

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });
});
