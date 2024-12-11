import React from "react";

import type { Decorator } from "@storybook/react";

import { LessonPlanTrackingContext } from "../../src/lib/analytics/lessonPlanTrackingContext";

export const LessonPlanTrackingDecorator: Decorator = (Story) => (
  <LessonPlanTrackingContext.Provider
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
  </LessonPlanTrackingContext.Provider>
);
