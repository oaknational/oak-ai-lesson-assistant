import { notFound } from "next/navigation";

import TestSupportSignInPage from "./sign-in";

/**
 * The playwright e2e tests call tRPC.prepareUser to create a test user and get a sign in token
 * This page instantiates a Clerk session with the token
 */

export default async function TestSupportSignIn() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.VERCEL_ENV !== "preview"
  ) {
    return notFound();
  }
  return <TestSupportSignInPage />;
}
