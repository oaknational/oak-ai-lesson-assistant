import React from "react";

import { ClerkProvider } from "../src/mocks/clerk/nextjs";

export const MockClerkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};
