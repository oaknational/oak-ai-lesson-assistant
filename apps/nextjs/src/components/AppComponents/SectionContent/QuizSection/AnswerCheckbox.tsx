import React from "react";
import type { ReactNode } from "react";

import { OakBox, OakFlex, OakIcon } from "@oaknational/oak-components";

type AnswerCheckboxProps = {
  children?: ReactNode;
  index?: number;
};

const AnswerCheckboxBase = ({ children, index = 0 }: AnswerCheckboxProps) => {
  // Calculate rotation and offsets based on index for handwritten feel
  const rotations = [-2, 1.5, -1.5, 2.5, 0, -3, 1];
  const xOffsets = [0.25, -0.25, 0, 0.25, -0.25, 0, 0.25];
  const yOffsets = [-0.25, 0, 0.25, -0.25, 0.25, 0, -0.25];

  const rotation = rotations[index % rotations.length];
  const xOffset = xOffsets[index % xOffsets.length];
  const yOffset = yOffsets[index % yOffsets.length];

  return (
    <OakFlex
      $mr="space-between-xs"
      $width="all-spacing-7"
      $height="all-spacing-7"
      $ba="border-solid-m"
      $borderColor="black"
      $flexShrink="0"
      $alignItems="center"
      $justifyContent="center"
      $font="body-1-bold"
      $color="icon-success"
    >
      <span
        style={{
          transform: `rotate(${rotation}deg) translate(${xOffset}px, ${yOffset}px)`,
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
    />
  );
};

export const AnswerCheckbox = Object.assign(AnswerCheckboxBase, {
  Check,
});
