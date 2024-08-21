"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/AppComponents/Chat/ui/button";
import { IconNextChat } from "@/components/AppComponents/Chat/ui/icons";

export function UserOrLogin() {
  if (typeof window === "undefined") {
    return <></>;
  }
  return (
    <>
      <SignedIn>
        <div className=" flex items-center justify-end space-x-15">
          <Link className="text-base" href={"/aila/help"} target="_blank">
            Help
          </Link>

          <Link className="text-base" href={"/"}>
            AI experiments
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="mr-7 h-14 w-14 dark:hidden" inverted />
          <IconNextChat className="mr-7 hidden h-14 w-14 dark:block" />
        </Link>
      </SignedOut>
      <div className="ml-15 flex items-center">
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
