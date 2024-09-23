"use client";

import { OakBox } from "@oaknational/oak-components";
import { PortableText } from "@portabletext/react";
import { PolicyDocument } from "cms/types/policyDocument";

import Layout from "@/components/Layout";
import { portableTextComponents } from "@/components/PortableText/portableTextComponents";

interface LegalContentProps {
  pageData: PolicyDocument;
}

export const LegalContent = ({ pageData }: LegalContentProps) => {
  return (
    <Layout>
      <OakBox $ph="inner-padding-xl">
        <PortableText
          value={pageData.body}
          components={portableTextComponents}
        />
      </OakBox>
    </Layout>
  );
};

export default LegalContent;
