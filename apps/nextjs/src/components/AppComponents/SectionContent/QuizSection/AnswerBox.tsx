import React from "react";
import type { ReactNode } from "react";

import { OakFlex, OakIcon } from "@oaknational/oak-components";

type AnswerBoxProps = {
  /**
   * Content to display in the answer box.
   * Use <AnswerBox.Check /> for correct answers.
   */
  children?: ReactNode;
};

const AnswerBoxBase = ({ children }: AnswerBoxProps) => {
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
