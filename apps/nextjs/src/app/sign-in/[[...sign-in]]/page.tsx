"use client";

import { useEffect } from "react";

import { SignIn, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import SignUpSignInLayout from "@/components/SignUpSignInLayout";

import DetectStuckBannedUser from "./DetectStuckBannedUser";

const SignInPage = () => {
  return (
    <>
      <SignUpSignInLayout loaded={true}>
        <SignedOut>
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </SignedOut>
        <SignedIn>
          <RedirectToHome />
        </SignedIn>
      </SignUpSignInLayout>

      <DetectStuckBannedUser />
    </>
  );
};

const RedirectToHome = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user && isLoaded) {
      router.push("/");
    }
  }, [router, user, isLoaded]);
  return null;
};

export default SignInPage;
