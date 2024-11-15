"use client";

import { OakBox } from "@oaknational/oak-components";
import { PortableText } from "@portabletext/react";
import type { PolicyDocument } from "cms/types/policyDocument";

import Layout from "@/components/Layout";
import { portableTextComponents } from "@/components/PortableText/portableTextComponents";

interface LegalContentProps {
  pageData: PolicyDocument;
}

export const LegalContent = ({ pageData }: LegalContentProps) => {
  return (
    <OakBox $ph="inner-padding-xl">
      <PortableText value={pageData.body} components={portableTextComponents} />
    </OakBox>
  );
};

export default function LegalPage(props: LegalContentProps) {
  return (
    <Layout>
      <LegalContent {...props} />
    </Layout>
  );
}
