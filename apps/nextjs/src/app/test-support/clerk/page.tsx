import { notFound } from "next/navigation";

/**
 * The playwright e2e tests call clerk.signIn to log in
 * This is a minimal page that gives it access to a clerk instance
 */

export default async function TestSupportSignIn() {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.VERCEL_ENV !== "preview"
  ) {
    return notFound();
  }
  return "Waiting for clerk...";
}
