"use client";

import { useEffect } from "react";

import { Show, SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import SignUpSignInLayout from "@/components/SignUpSignInLayout";

import DetectEmailLinkBannedUser from "./DetectEmailLinkBannedUser";
import DetectStuckBannedUser from "./DetectStuckBannedUser";

const SignInPage = () => {
  return (
    <>
      <SignUpSignInLayout loaded={true}>
        <Show when="signed-out">
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </Show>
        <Show when="signed-in">
          <RedirectToHome />
        </Show>
      </SignUpSignInLayout>
      <DetectStuckBannedUser />
      <DetectEmailLinkBannedUser />
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
