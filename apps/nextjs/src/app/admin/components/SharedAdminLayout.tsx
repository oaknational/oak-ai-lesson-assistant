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
              $maxWidth={["all-spacing-21", "all-spacing-24"]}
              $pa="inner-padding-m"
              $ph={["inner-padding-none", "inner-padding-s"]}
            >
              {children}
            </OakMaxWidth>
          </div>
        </Layout>
      </div>
    </div>
  );
}
