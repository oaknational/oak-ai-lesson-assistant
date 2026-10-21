"use client";

import {
  OakHeading,
  OakLink,
  OakOL,
  OakP,
  OakUL,
} from "@oaknational/oak-components";
import type {
  PortableTextBlockComponent,
  PortableTextComponents,
} from "@portabletext/react";
import Link from "next/link";
import styled, { css } from "styled-components";

// default styling is being overridden here by tailwind, we can remove this when re removing tailwind
const listSpacing = css`
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 40px;
  padding-left: 20px;
`;

const StyledUL = styled(OakUL)`
  list-style-type: disc;
  ${listSpacing}
`;

// OakOL numbers items with CSS counters, so it only needs the spacing
const StyledOL = styled(OakOL)`
  ${listSpacing}
`;

const heading2: PortableTextBlockComponent = ({ children }) => (
  <OakHeading
    tag="h2"
    $mb="spacing-16"
    $font={["heading-5", "heading-4"]}
    $mt="spacing-24"
  >
    {children}
  </OakHeading>
);

// Our Sanity schema names heading styles heading1..heading6, not the Portable Text default h1..h6
export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <OakP $mb="spacing-16">{children}</OakP>,
    // The page title is the h1, so a body heading1 steps down a level
    heading1: heading2,
    heading2,
    heading3: ({ children }) => (
      <OakHeading
        tag="h3"
        $mb="spacing-16"
        $font={["heading-6", "heading-5"]}
        $mt="spacing-24"
      >
        {children}
      </OakHeading>
    ),
    heading4: ({ children }) => (
      <OakHeading
        tag="h4"
        $mb="spacing-16"
        $font={["heading-7", "heading-6"]}
        $mt="spacing-24"
      >
        {children}
      </OakHeading>
    ),
    heading5: ({ children }) => (
      <OakHeading tag="h5" $mb="spacing-16" $font="heading-7" $mt="spacing-24">
        {children}
      </OakHeading>
    ),
    heading6: ({ children }) => (
      <OakHeading tag="h6" $mb="spacing-16" $font="heading-7" $mt="spacing-24">
        {children}
      </OakHeading>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      <OakLink href={value.href} element={Link} target="_blank">
        {children}
      </OakLink>
    ),
  },
  list: {
    bullet: (props) => <StyledUL>{props.children}</StyledUL>,
    number: (props) => <StyledOL>{props.children}</StyledOL>,
  },
};
