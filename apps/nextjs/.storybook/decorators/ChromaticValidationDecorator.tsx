import React from "react";

import { Decorator } from "@storybook/react";

export const ChromaticValidationDecorator: Decorator = (
  Story,
  { parameters },
) => {
  if (
    !parameters.chromatic?.modes ||
    Object.keys(parameters.chromatic.modes).length === 0
  ) {
    throw new Error("No chromatic parameters set");
  }
  return <Story />;
};
