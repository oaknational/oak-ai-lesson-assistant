"use client";

import { OakBox } from "@oaknational/oak-components";
import { PortableText } from "@portabletext/react";
import { PolicyDocument } from "cms/data/fetchPolicyDocument";

import Layout from "@/components/Layout";
import { protableTextComponents } from "@/components/PortableText/protableTextComponents";

interface LegalContentProps {
  pageData: PolicyDocument;
}

export const LegalContent = ({ pageData }: LegalContentProps) => {
  return (
    <Layout>
      <OakBox $ph="inner-padding-xl">
        <PortableText
          value={pageData.body}
          components={protableTextComponents}
        />
      </OakBox>
    </Layout>
  );
};

export default LegalContent;
