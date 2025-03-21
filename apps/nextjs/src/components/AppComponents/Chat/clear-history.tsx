"use client";

import * as React from "react";

import { OakFlex, OakSpan } from "@oaknational/oak-components";

import BinIcon from "@/components/BinIcon";
import { useTranslation } from "@/components/ContextProviders/LanguageContext";

import { useDialog } from "../DialogContext";

type ClearHistoryProps = {
  isEnabled: boolean;
};

export function ClearHistory({ isEnabled }: Readonly<ClearHistoryProps>) {
  const { setDialogWindow, setOpenSidebar } = useDialog();
  const { t } = useTranslation();

  if (!isEnabled) {
    return null;
  }
  return (
    <OakFlex
      $justifyContent="flex-start"
      $gap="all-spacing-2"
      $alignItems="center"
    >
      <BinIcon />
      <button
        onClick={() => {
          setOpenSidebar(false);
          setDialogWindow("clear-history");
        }}
      >
        <OakSpan $font="body-3-bold" $color="black" $textDecoration="none">
          {t("sidebar.clearHistory")}
        </OakSpan>
      </button>
    </OakFlex>
  );
}
