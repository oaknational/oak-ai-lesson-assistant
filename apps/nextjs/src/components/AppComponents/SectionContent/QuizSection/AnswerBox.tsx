import React from "react";
import type { ReactNode } from "react";

import { OakFlex, OakIcon } from "@oaknational/oak-components";

type AnswerBoxProps = {
  /**
   * Content to display in the answer box.
   * Use <AnswerBox.Check /> for correct answers.
   */
  children?: ReactNode;
  wobbleOffset?: number;
};

// Generate transform for handwritten feel based on variant
const getWobbleTransform = (variant: number | undefined) => {
  if (variant === undefined) {
    return undefined;
  }

  const rotations = [-1.5, 1.5, -1.5, 2.5, 0, -3, 1];
  const xOffsets = [0.25, -0.25, 0, 0.25, -0.25, 0, 0.25];
  const yOffsets = [-0.25, 0, 0.25, -0.25, 0.25, 0, -0.25];

  const rotation = rotations[variant % rotations.length];
  const xOffset = xOffsets[variant % xOffsets.length];
  const yOffset = yOffsets[variant % yOffsets.length];

  return `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`;
};

const AnswerBoxBase = ({ children, wobbleOffset }: AnswerBoxProps) => {
  return (
    <OakFlex
      $mr="space-between-xs"
      $width="all-spacing-7"
      $height="all-spacing-7"
      $ba="border-solid-m"
      $borderColor="border-primary"
      $borderRadius="border-radius-s"
      $background="bg-primary"
      $flexShrink="0"
      $alignItems="center"
      $justifyContent="center"
      $font="body-1-bold"
      $color="text-success"
    >
      <span
        style={{
          transform: getWobbleTransform(wobbleOffset),
          display: "block",
          width: "100%",
          height: "100%",
          textAlign: "center",
        }}
      >
        {children}
      </span>
    </OakFlex>
  );
};

const Check = () => {
  return (
    <OakIcon
      iconName="tick"
      $width="100%"
      $height="100%"
      $colorFilter="icon-success"
      $transform="scale(1.15)"
      aria-label="Correct"
    />
  );
};

export const AnswerBox = Object.assign(AnswerBoxBase, {
  Check,
});
