"use client";

import { OakMaxWidth } from "@oaknational/oak-components";

import Layout from "@/components/AppComponents/Layout";

interface SharedAdminLayoutProps {
  children: React.ReactNode;
}

export default function SharedAdminLayout({
  children,
}: Readonly<SharedAdminLayoutProps>) {
  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="group w-full overflow-auto pl-0 duration-300 ease-in-out animate-in peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
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
