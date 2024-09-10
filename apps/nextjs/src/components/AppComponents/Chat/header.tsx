"use client";

import * as React from "react";

import { OakIcon } from "@oaknational/oak-components";
import { useClerkDemoMetadata } from "hooks/useClerkDemoMetadata";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { Icon } from "@/components/Icon";
import OakIconLogo from "@/components/OakIconLogo";

import { BetaTagHeader } from "./beta-tag";
import { ChatHistory } from "./chat-history";
import { SidebarMobile } from "./sidebar-mobile";
import { UserOrLogin } from "./user-or-login";

export function Header() {
  const demo = useDemoUser();

  // Check whether clerk metadata has loaded to prevent the banner from flashing
  const clerkMetadata = useClerkDemoMetadata();

  const ailaId = usePathname().split("aila/")[1];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {clerkMetadata.isSet && demo.isDemoUser && (
        <div className="flex h-28 items-center border-b-2 border-black bg-lemon px-15 py-6 sm:h-26 md:h-22">
          <div>
            <strong className="font-semibold">
              Create {demo.appSessionsPerMonth} lessons per month
            </strong>
            <span className="mx-8">•</span>
            <span>If you are a teacher in the UK,</span>{" "}
            <a href={demo.contactHref} className="underline">
              contact us for full access.
            </a>
          </div>
          <a href={demo.contactHref}>
            <Icon icon="chevron-right" size="sm" />
          </a>
          <div className="grow" />
          {demo.appSessionsRemaining !== undefined && (
            <strong className="hidden font-semibold lg:block">
              {demo.appSessionsRemaining} of {demo.appSessionsPerMonth} lessons
              remaining
            </strong>
          )}
        </div>
      )}

      <div className="flex h-26 shrink-0 items-center justify-between border-b-2 border-black bg-white px-10">
        <div className="flex items-center gap-9">
          <span className="flex items-center justify-center gap-9">
            <Link href="/" aria-label="go to home page">
              <OakIconLogo />
            </Link>
            <span className="text-xl font-bold text-black">Aila</span>
          </span>
          <div className="flex">
            <BetaTagHeader />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-12">
          <Link
            className="hidden items-center sm:flex"
            href={ailaId ? `/help/?ailaId=${ailaId}` : "/help"}
            target="_blank"
          >
            <OakIcon iconName="question-mark" $width="all-spacing-6" />
            <div className="ml-6 text-sm font-semibold text-black">Help</div>
          </Link>
          <div className="= flex items-center">
            <UserOrLogin />
          </div>
          <div className="flex">
            <SidebarMobile>
              <ChatHistory />
            </SidebarMobile>
          </div>
        </div>
      </div>
    </header>
  );
}
