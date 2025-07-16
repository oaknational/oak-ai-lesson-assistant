import { OakBox, OakFlex, OakIcon } from "@oaknational/oak-components";
import type { ReactNode } from "react";

type AnswerCheckboxProps = {
  children?: ReactNode;
};

const AnswerCheckboxBase = ({ children }: AnswerCheckboxProps) => {
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
      $font="body-2-bold"
      $color="icon-success"
    >
      {children}
    </OakFlex>
  );
};

const Check = () => {
  return (
    <OakIcon
      iconName="tick"
      $width="100%"
      $height="100%"
      $color="icon-success"
      $transform="scale(1.15)"
    />
  );
};

export const AnswerCheckbox = Object.assign(AnswerCheckboxBase, {
  Check,
});