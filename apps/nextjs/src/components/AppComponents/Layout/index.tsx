"use client";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import Footer from "@/components/Footer";

import { Header } from "../Chat/header";
import { DialogProvider } from "../DialogContext";

export type LayoutProps = Readonly<{
  readonly children: React.ReactNode;
  readonly includeFooter?: boolean;
}>;

const Layout = ({ children, includeFooter }: LayoutProps) => {
  const isDemoUser = useDemoUser().isDemoUser;
  return (
    <DialogProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main
          className={`flex h-full flex-1 flex-col bg-muted/50 bg-white ${isDemoUser && "pt-28 sm:pt-20"}`}
        >
          {children}
        </main>
        {includeFooter && <Footer />}
      </div>
    </DialogProvider>
  );
};

export default Layout;
