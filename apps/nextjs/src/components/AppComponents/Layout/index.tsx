"use client";

import Footer from "@/components/Footer";

import { Header } from "../Chat/header";
import { DialogProvider } from "../DialogContext";

const Layout = ({
  children,
  featureFlag,
  includeFooter,
}: {
  children: React.ReactNode;
  featureFlag: boolean;
  includeFooter?: boolean;
}) => {
  return (
    <div className="flex min-h-screen flex-col ">
      <Header />
      <main className="flex h-full flex-1 flex-col bg-muted/50 bg-white">
        <DialogProvider>{children}</DialogProvider>
      </main>
      {includeFooter && <Footer featureFlag={featureFlag} />}
    </div>
  );
};

export default Layout;
