"use client";

import * as React from "react";

import { OakIcon } from "@oaknational/oak-components";
import Link from "next/link";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { Icon } from "@/components/Icon";
import OakIconLogo from "@/components/OakIconLogo";

import BetaTag from "./beta-tag";
import { ChatHistory } from "./chat-history";
import { SidebarMobile } from "./sidebar-mobile";
import { UserOrLogin } from "./user-or-login";

export function Header() {
  const demo = useDemoUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 ">
      {demo.isDemoUser && (
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

      <div className="flex h-26  shrink-0 items-center justify-between border-b-2 border-black  bg-white  px-10  ">
        <div className="flex items-center gap-10">
          <div className="hidden sm:flex">
            <SidebarMobile>
              <ChatHistory />
            </SidebarMobile>
          </div>
          <div className="flex items-center gap-10">
            <span className="hidden font-bold sm:block">
              AI lesson assistant
            </span>
            <span className="flex items-center justify-center gap-9  sm:hidden">
              <Link href="/" aria-label="go to home page">
                <OakIconLogo />
              </Link>
              <span className="text-xl font-bold">Aila</span>
            </span>
            <div className="hidden sm:flex">
              <BetaTag />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-12">
          <div className="flex sm:hidden">
            <Link href="/aila/help">
              <OakIcon iconName="question-mark" />
            </Link>
          </div>
          <div className="= flex items-center">
            <UserOrLogin />
          </div>
          <div className="flex sm:hidden">
            <SidebarMobile>
              <ChatHistory />
            </SidebarMobile>
          </div>
        </div>
      </div>
    </header>
  );
}
