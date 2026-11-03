/**
 * @jest-environment jsdom
 */
import { useState } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";

import MainNavigation from ".";

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: false }),
}));
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
jest.mock("@/lib/analytics/useAnalytics", () => ({
  __esModule: true,
  default: () => ({ track: {} }),
}));
let openMenu: () => void;
function MenuWithToggle() {
  const [menuOpen, setMenuOpen] = useState(false);
  openMenu = () => setMenuOpen(true);
  return <MainNavigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />;
}

describe("MainNavigation", () => {
  it("slides the menu in and focuses its close button", async () => {
    render(<MenuWithToggle />);

    act(() => openMenu());

    // Headless UI 2 passes the transition's classes as a className prop
    const menu = await screen.findByRole("navigation");
    await waitFor(() => expect(menu.className).toMatch(/translate-x-/));
    expect(menu.className).toContain("fixed");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "cross icon button" }),
      ),
    );
  });
});
