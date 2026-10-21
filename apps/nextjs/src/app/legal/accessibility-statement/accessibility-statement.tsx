"use client";

import { OakBox, OakHeading } from "@oaknational/oak-components";
import { PortableText } from "@portabletext/react";

import type { PolicyDocument } from "@/cms/types/policyDocument";
import Layout from "@/components/Layout";
import { portableTextComponents } from "@/components/PortableText/portableTextComponents";

export type AccessibilityStatementContentProps = Readonly<{
  pageData: PolicyDocument;
}>;

export const AccessibilityStatementContent = ({
  pageData,
}: AccessibilityStatementContentProps) => {
  return (
    <OakBox $ph="spacing-24">
      <OakHeading
        tag="h1"
        $mb="spacing-16"
        $font={["heading-4", "heading-3"]}
        $mt="spacing-24"
      >
        {pageData.title}
      </OakHeading>
      <PortableText value={pageData.body} components={portableTextComponents} />
    </OakBox>
  );
};

export default function AccessibilityStatementPage(
  props: AccessibilityStatementContentProps,
) {
  return (
    <Layout>
      <AccessibilityStatementContent {...props} />
    </Layout>
  );
}
