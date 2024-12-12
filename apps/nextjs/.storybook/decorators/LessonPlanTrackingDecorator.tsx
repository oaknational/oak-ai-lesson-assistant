import React from "react";

import type { Decorator } from "@storybook/react";
import { fn } from "@storybook/test";

import { LessonPlanTrackingContext } from "../../src/lib/analytics/lessonPlanTrackingContext";

export const LessonPlanTrackingDecorator: Decorator = (Story) => (
  <LessonPlanTrackingContext.Provider
    value={{
      onClickContinue: fn(),
      onClickRetry: fn(),
      onClickStartFromExample: fn(),
      onClickStartFromFreeText: fn(),
      onStreamFinished: fn(),
      onSubmitText: fn(),
    }}
  >
    <Story />
  </LessonPlanTrackingContext.Provider>
);
