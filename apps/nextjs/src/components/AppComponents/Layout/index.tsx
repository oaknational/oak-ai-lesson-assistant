"use client";

import Footer from "@/components/Footer";

import { Header } from "../Chat/header";
import { DialogProvider } from "../DialogContext";

const Layout = ({
  children,
  includeFooter,
}: {
  children: React.ReactNode;
  includeFooter?: boolean;
}) => {
  return (
    <div className="flex min-h-screen flex-col ">
      <Header />
      <main className="flex h-full flex-1 flex-col bg-muted/50 bg-white">
        <DialogProvider>{children}</DialogProvider>
      </main>
      {includeFooter && <Footer />}
    </div>
  );
};

export default Layout;
