"use client";

import { Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/AppComponents/Chat/ui/button";

export function UserOrLogin() {
  return (
    <div className="flex items-center sm:ml-8">
      <Show when="signed-in">
        <UserButton />
      </Show>
      <Show when="signed-out">
        <Button variant="link" asChild className="-ml-7">
          <Link href="/sign-in?callbackUrl=/">Log in</Link>
        </Button>
      </Show>
    </div>
  );
}
