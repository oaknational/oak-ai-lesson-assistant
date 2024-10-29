"use client";

import { OakHeading, OakLink } from "@oaknational/oak-components";
import type { PortableTextComponents } from "@portabletext/react";
import Link from "next/link";

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
      <OakLink href={value.href} element={Link} target="_blank">
        {children}
      </OakLink>
    ),
  },
};
