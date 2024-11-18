"use client";

import * as React from "react";

import { OakFlex, OakSpan } from "@oaknational/oak-components";
import styled from "styled-components";

import BinIcon from "@/components/BinIcon";
import OakBoxWithCustomWidth from "@/components/OakBoxWithCustomWidth";

import { useDialog } from "../DialogContext";

type ClearHistoryProps = {
  isEnabled: boolean;
};

const OakBoxWithCustomWidthFullWidthMobile = styled(OakBoxWithCustomWidth)`
  @media (max-width: 600px) {
    width: 100%;
  }
`;

export function ClearHistory({ isEnabled }: Readonly<ClearHistoryProps>) {
  const { setDialogWindow } = useDialog();
  if (!isEnabled) {
    return null;
  }
  return (
    <OakBoxWithCustomWidthFullWidthMobile
      width={447}
      $position="fixed"
      $right="all-spacing-0"
      $bottom="all-spacing-0"
      $bt="border-solid-s"
      $borderColor="grey30"
      $background="white"
    >
      <OakFlex
        $justifyContent="flex-start"
        $pv="inner-padding-xl2"
        $ph="inner-padding-m"
        $gap="all-spacing-2"
        $alignItems="center"
      >
        <BinIcon />
        <button
          onClick={() => {
            setDialogWindow("clear-history");
          }}
        >
          <OakSpan $font="body-3-bold" $color="black" $textDecoration="none">
            Delete all lessons
          </OakSpan>
        </button>
      </OakFlex>
    </OakBoxWithCustomWidthFullWidthMobile>
  );
}
