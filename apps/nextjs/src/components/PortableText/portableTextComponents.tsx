"use client";

import { OakHeading, OakLink, OakUL } from "@oaknational/oak-components";
import type { PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import styled from "styled-components";

// default styling is being overridden here by tailwind, we can remove this when re removing tailwind
const StyledUL = styled(OakUL)`
  list-style-type: disc;
  margin-top: 1em;
  margin-bottom: 1em;
  margin-left: 40px;
  padding-left: 20px;
`;

export const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <OakHeading
        tag="h1"
        $mb="space-between-s"
        $font="heading-4"
        $mt="space-between-m"
      >
        {children}
      </OakHeading>
    ),
    h2: ({ children }) => (
      <OakHeading
        tag="h2"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {children}
      </OakHeading>
    ),
    h3: ({ children }) => (
      <OakHeading
        tag="h3"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {children}
      </OakHeading>
    ),
    h4: ({ children }) => (
      <OakHeading
        tag="h4"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
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
  },
};
