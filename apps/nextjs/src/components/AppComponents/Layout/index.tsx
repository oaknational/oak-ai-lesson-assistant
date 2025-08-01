"use client";

import Footer from "@/components/Footer";

import { Header } from "../Chat/header";
import { DialogProvider } from "../DialogContext";

export type LayoutProps = Readonly<{
  readonly children: React.ReactNode;
  readonly includeFooter?: boolean;
  feature?: "teachingMaterials" | "aila";
}>;

const Layout = ({ children, includeFooter, feature }: LayoutProps) => {
  return (
    <DialogProvider>
      <div className="flex min-h-screen flex-col">
        <Header page={feature} />

        <main className={`} flex h-full flex-1 flex-col bg-muted/50 bg-white`}>
          {children}
        </main>
        {includeFooter && <Footer />}
      </div>
    </DialogProvider>
  );
};

export default Layout;
