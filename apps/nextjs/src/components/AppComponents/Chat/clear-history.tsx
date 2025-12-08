"use client";

import * as React from "react";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import BinIcon from "@/components/BinIcon";

import { useDialog } from "../DialogContext";

type ClearHistoryProps = {
  isEnabled: boolean;
};

export function ClearHistory({ isEnabled }: Readonly<ClearHistoryProps>) {
  const { setDialogWindow, setOpenSidebar } = useDialog();
  if (!isEnabled) {
    return null;
  }
  return (
    <OakFlex
      $justifyContent="flex-start"
      $gap="spacing-8"
      $alignItems="center"
      $pa={"spacing-8"}
    >
      <BinIcon />
      <button
        onClick={() => {
          setOpenSidebar(false);
          setDialogWindow("clear-history");
        }}
      >
        <OakSpan
          $font="body-3-bold"
          $color="text-primary"
          $textDecoration="none"
        >
          Delete all lessons
        </OakSpan>
      </button>
    </OakFlex>
  );
}
