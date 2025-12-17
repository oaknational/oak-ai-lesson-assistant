"use client";

import { OakMaxWidth } from "@oaknational/oak-components";

import Layout from "@/components/AppComponents/Layout";

interface QuizRagLayoutProps {
  children: React.ReactNode;
}

export default function QuizRagLayout({
  children,
}: Readonly<QuizRagLayoutProps>) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in">
        <Layout>
          <div className="mt-27">
            <OakMaxWidth
              $maxWidth={["spacing-960"]}
              $pa="spacing-16"
              $ph={["spacing-0", "spacing-12"]}
            >
              {children}
            </OakMaxWidth>
          </div>
        </Layout>
      </div>
    </div>
  );
}
