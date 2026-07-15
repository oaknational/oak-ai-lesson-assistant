"use client";

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { useChatStore } from "@/stores/AilaStoresProvider";
import { trpc } from "@/utils/trpc";

const STORAGE_KEY = "aila-debug-overlay-collapsed";

function readInitialCollapsedState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function DebugOverlay() {
  const isAutomatedBrowser =
    typeof navigator !== "undefined" && navigator.webdriver;
  const { user, isLoaded } = useUser();
  const isAdmin =
    isLoaded &&
    user?.emailAddresses.some((email) =>
      email.emailAddress.endsWith("@thenational.academy"),
    );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const overlayState = trpc.debug.getAilaOverlayState.useQuery(undefined, {
    enabled: !!isAdmin && !isAutomatedBrowser,
  });
  const ailaStreamingStatus = useChatStore(
    (state) => state.ailaStreamingStatus,
  );

  useEffect(() => {
    setIsCollapsed(readInitialCollapsedState());
  }, []);

  if (isAutomatedBrowser || !isAdmin) {
    return null;
  }

  const rows = [
    {
      label: "Agentic",
      value: overlayState.isLoading
        ? "checking"
        : !overlayState.data
          ? "error"
          : overlayState.data.agenticEnabled
            ? "enabled"
            : "disabled",
    },
    {
      label: "Stream",
      value: ailaStreamingStatus,
    },
    {
      label: "Model",
      value: overlayState.isLoading
        ? "checking"
        : !overlayState.data
          ? "error"
          : overlayState.data.model,
    },
  ];

  function toggleCollapsed() {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  }

  return (
    <aside className="fixed bottom-[88px] right-10 z-[70] w-[260px] overflow-hidden rounded-sm border-2 border-black bg-white text-sm text-black shadow-lg">
      <button
        type="button"
        className={`flex w-full items-center justify-between gap-7 px-8 py-6 text-left font-bold ${
          isCollapsed ? "bg-white text-black" : "bg-oakGreen text-white"
        }`}
        onClick={toggleCollapsed}
        aria-expanded={!isCollapsed}
      >
        <span>Aila Debug</span>
        <span aria-hidden="true">{isCollapsed ? "+" : "-"}</span>
      </button>
      {!isCollapsed && (
        <dl className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-7 gap-y-4 px-8 py-6">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="font-bold">{row.label}:</dt>
              <dd className="min-w-0 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
