"use client";

import React from "react";

import Layout from "@/components/Layout";
import TermsContent from "@/components/TermsContent";

export const TermsAndConditions = (featureFlag) => {
  return (
    <Layout featureFlag={featureFlag}>
      <TermsContent />
    </Layout>
  );
};

export default TermsAndConditions;
