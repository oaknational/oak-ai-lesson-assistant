"use client";

import { OakMaxWidth } from "@oaknational/oak-components";

import Layout from "@/components/AppComponents/Layout";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: Readonly<ChatLayoutProps>) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in lg:peer-data-[state=open]:pl-[250px] xl:peer-data-[state=open]:pl-[300px]">
        <Layout>
          <div className="mt-27">
            <OakMaxWidth
              $maxWidth={["spacing-480", "spacing-1280"]}
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
