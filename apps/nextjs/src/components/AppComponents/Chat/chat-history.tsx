"use client";

import * as React from "react";

import { usePathname } from "#next/navigation";
import Link from "next/link";

import { SidebarList } from "@/components/AppComponents/Chat/sidebar-list";
import { buttonVariants } from "@/components/AppComponents/Chat/ui/button";
import { IconPlus } from "@/components/AppComponents/Chat/ui/icons";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { cn } from "@/lib/utils";

export function ChatHistory() {
  const { trackEvent } = useAnalytics();
  const path = usePathname();

  const idFromUrl = path.split("chat/")[1];
  return (
    <div className="flex h-full flex-col">
      <div className="my-10 px-7">
        <Link
          href="/aila"
          onClick={() => {
            trackEvent("chat:new_lesson_plan", { id: idFromUrl });
          }}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-20 w-full justify-start bg-zinc-50 px-10 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10",
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Lesson
        </Link>
      </div>
      <React.Suspense
        fallback={
          <div className="flex flex-1 flex-col space-y-10 overflow-auto px-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-full shrink-0 animate-pulse rounded-md bg-black bg-opacity-25"
              />
            ))}
          </div>
        }
      >
        <SidebarList />
      </React.Suspense>
    </div>
  );
}
