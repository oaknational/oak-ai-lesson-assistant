import React, { useMemo } from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import useAnalytics from "@/lib/analytics/useAnalytics";
import { ResourcesStoresContext } from "@/stores/ResourcesStoreProvider";
import { createResourcesStore } from "@/stores/resourcesStore";
import type { ResourcesState } from "@/stores/resourcesStore/types";

declare module "@storybook/csf" {
  interface Parameters {
    resourcesStoreState?: Partial<ResourcesState>;
  }
}

const trackEvents = {
  lessonPlanInitiated: fn(),
  lessonPlanRefined: fn(),
  lessonPlanCompleted: fn(),
  lessonPlanTerminated: fn(),
} as unknown as ReturnType<typeof useAnalytics>["track"];

export const ResourcesStoreDecorator: Decorator = (Story, { parameters }) => {
  const stores = useMemo(() => {
    // Default values for the store
    const defaultState: Partial<ResourcesState> = {
      stepNumber: 2, // Most dialogs appear after initial setup
      docType: "additional-glossary",
      pageData: {
        lessonPlan: {
          lessonId: "mock-lesson-id",
          title: "Mock Lesson",
        },
      },
      threatDetection: true,
      moderation: {
        justification: "This contains content that requires guidance.",
        categories: ["l/strong-language", "u/sensitive-content"],
      },
      error: {
        type: "unknown",
        message: "An unexpected error occurred while generating your resource.",
      },
    };

    // Create the store with merged initial values from parameters
    const resourcesStore = createResourcesStore(trackEvents, {
      ...defaultState,
      ...parameters.resourcesStoreState,
    });

    return {
      resources: resourcesStore,
    };
  }, [parameters.resourcesStoreState]);

  return (
    <ResourcesStoresContext.Provider value={stores}>
      <Story />
    </ResourcesStoresContext.Provider>
  );
};
