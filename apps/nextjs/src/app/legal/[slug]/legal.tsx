"use client";

import { OakBox } from "@oaknational/oak-components";
import { PortableText } from "@portabletext/react";

import Layout from "@/components/Layout";
import { protableTextComponents } from "@/components/PortableText/protableTextComponents";

interface PortableText {
  _key: string;
  _type: string;
  children: unknown[];
  markDefs: unknown[];
  style: string;
}
interface LegalContentProps {
  pageData: {
    title: string;
    slug: string;
    fake_updatedAt: string;
    body: PortableText[];
  };
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
