"use client";

import * as React from "react";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { Icon } from "@/components/Icon";

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

      <div className="flex h-26 shrink-0 items-center justify-between border-b-2 border-black bg-white  px-10 ">
        <div className="flex items-center gap-10">
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
          <div className="flex items-center gap-10">
            <span className="font-bold">AI lesson assistant</span>
            <BetaTag />
          </div>
          <p className="text-sm">
            <a
              href="https://docs.google.com/forms/d/1yRiO9DOGuCXR6Phyr8gaKFh7-Lr_4sFpVxXZ2igQH7A/edit"
              target="_blank"
              className="font-bold text-blue underline"
            >
              Give feedback
            </a>{" "}
            to help us improve!
          </p>
        </div>
        <div className="flex items-center justify-end space-x-10">
          <div className="hidden items-center sm:flex">
            <UserOrLogin />
          </div>
        </div>
      </div>
    </header>
  );
}
