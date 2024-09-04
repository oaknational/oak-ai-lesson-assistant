"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/AppComponents/Chat/ui/button";

export function UserOrLogin() {
  if (typeof window === "undefined") {
    return <></>;
  }
  return (
    <>
      <div className="flex items-center sm:ml-8">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button variant="link" asChild className="-ml-7">
            <Link href="/sign-in?callbackUrl=/">Log in</Link>
          </Button>
        </SignedOut>
      </div>
    </>
  );
}
