import React from "react";

import type { Decorator } from "@storybook/react";

import { lessonPlanTrackingContext } from "../../src/lib/analytics/lessonPlanTrackingContext";

export const LessonPlanTrackingDecorator: Decorator = (Story) => (
  <lessonPlanTrackingContext.Provider
    value={{
      onClickContinue: () => {},
      onClickRetry: () => {},
      onClickStartFromExample: () => {},
      onClickStartFromFreeText: () => {},
      onStreamFinished: () => {},
      onSubmitText: () => {},
    }}
  >
    <Story />
  </lessonPlanTrackingContext.Provider>
);
