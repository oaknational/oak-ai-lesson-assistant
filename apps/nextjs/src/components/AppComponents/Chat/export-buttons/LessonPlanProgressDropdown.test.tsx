/**
 * // Important - we need to set the jest-environment to jsdom
 * @jest-environment jsdom
 */
import React from "react";

import { composeStories } from "@storybook/react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";

import * as stories from "./LessonPlanProgressDropdown.stories";

const { PartiallyCompleted, FullyCompleted, PartialCycles } =
  composeStories(stories);

describe("LessonPlanProgressDropdown", () => {
  it("displays the dropdown menu when clicked and shows correct completed sections", async () => {
    render(<PartiallyCompleted />);

    // Click the button to open the dropdown
    fireEvent.click(screen.getByTestId("chat-progress"));

    await waitFor(
      () => {
        expect(
          screen.getByTestId("lesson-plan-progress-dropdown-content"),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    ); // Increase timeout if necessary

    const cyclesSection = screen.getByTestId(
      "lesson-plan-progress-dropdown-content",
    );
    expect(cyclesSection).toBeInTheDocument();
    expect(cyclesSection).toHaveTextContent("Learning cycles");
    const dropdownContent = screen.getByTestId(
      "lesson-plan-progress-dropdown-content",
    );
    const sectionStates = [
      { name: "Lesson details", completed: true },
      { name: "Learning outcome", completed: true },
      { name: "Learning cycle outcomes", completed: true },
      { name: "Prior knowledge", completed: true },
      { name: "Key learning points", completed: true },
      { name: "Misconceptions", completed: true },
      { name: "Keywords", completed: false },
      { name: "Starter quiz", completed: false },
      { name: "Learning cycles", completed: true },
      { name: "Exit quiz", completed: false },
    ];

    sectionStates.forEach(({ name, completed }) => {
      const sectionElement = within(dropdownContent).getByText(name);
      const button = sectionElement.closest("button");

      if (completed) {
        expect(button).toContainHTML('alt="tick"');
      } else {
        expect(button).not.toContainHTML('alt="tick"');
      }
    });
  });

  it("displays all sections as completed for FullyCompleted", async () => {
    render(<FullyCompleted />);

    fireEvent.click(screen.getByTestId("chat-progress"));

    await waitFor(
      () => {
        expect(
          screen.getByTestId("lesson-plan-progress-dropdown-content"),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    const dropdownContent = screen.getByTestId(
      "lesson-plan-progress-dropdown-content",
    );
    const allSections = [
      "Lesson details",
      "Learning outcome",
      "Learning cycle outcomes",
      "Prior knowledge",
      "Key learning points",
      "Misconceptions",
      "Keywords",
      "Starter quiz",
      "Learning cycles",
      "Exit quiz",
    ];

    allSections.forEach((name) => {
      const sectionElement = within(dropdownContent).getByText(name);
      const button = sectionElement.closest("button");
      expect(button).toContainHTML('alt="tick"');
    });
  });

  it("displays correct completed sections for PartialCycles", async () => {
    render(<PartialCycles />);

    fireEvent.click(screen.getByTestId("chat-progress"));

    await waitFor(
      () => {
        expect(
          screen.getByTestId("lesson-plan-progress-dropdown-content"),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    const dropdownContent = screen.getByTestId(
      "lesson-plan-progress-dropdown-content",
    );
    const sectionStates = [
      { name: "Lesson details", completed: true },
      { name: "Learning outcome", completed: true },
      { name: "Learning cycle outcomes", completed: true },
      { name: "Prior knowledge", completed: true },
      { name: "Key learning points", completed: false },
      { name: "Misconceptions", completed: false },
      { name: "Keywords", completed: false },
      { name: "Starter quiz", completed: false },
      { name: "Learning cycles", completed: true },
      { name: "Exit quiz", completed: false },
    ];

    sectionStates.forEach(({ name, completed }) => {
      const sectionElement = within(dropdownContent).getByText(name);
      const button = sectionElement.closest("button");

      if (completed) {
        expect(button).toContainHTML('alt="tick"');
      } else {
        expect(button).not.toContainHTML('alt="tick"');
      }
    });
  });
});
