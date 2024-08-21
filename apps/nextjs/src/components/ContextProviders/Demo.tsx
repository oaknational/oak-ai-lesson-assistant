import { createContext, useContext, useMemo } from "react";

import { useUser } from "#clerk/nextjs";

import { trpc } from "@/utils/trpc";

if (!process.env.NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D) {
  throw new Error(
    "NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D is required",
  );
}
const DEMO_APP_SESSIONS_PER_30D = parseInt(
  process.env.NEXT_PUBLIC_RATELIMIT_DEMO_APP_SESSIONS_PER_30D,
  10,
);

export type DemoContextProps =
  | {
      isDemoUser: true;
      appSessionsRemaining: number | undefined;
      appSessionsPerMonth: number;
      contactHref: string;
      isSharingEnabled: boolean;
    }
  | {
      isDemoUser: false;
      isSharingEnabled: boolean;
    };

const DemoContext = createContext<DemoContextProps | null>(null);

function useIsDemoClerkUser(): boolean {
  const user = useUser();

  if (process.env.NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED !== "true") {
    return false;
  }

  if (!user.isSignedIn) {
    return false;
  }

  if (!("isDemoUser" in user.user.publicMetadata)) {
    console.warn("User metadata is missing isDemoUser field");
    return true;
  }
  return Boolean(user.user.publicMetadata.isDemoUser);
}

export type DemoProviderProps = Readonly<{ children: React.ReactNode }>;

export function DemoProvider({ children }: Readonly<DemoProviderProps>) {
  const isDemoUser = useIsDemoClerkUser();
  const remainingAppSessions = trpc.chat.appSessions.remainingLimit.useQuery(
    undefined,
    { enabled: isDemoUser },
  );

  const isSharingEnabled =
    !isDemoUser || process.env.NEXT_PUBLIC_DEMO_SHARING_ENABLED === "true";

  const appSessionsRemaining = remainingAppSessions.isSuccess
    ? remainingAppSessions.data.remaining
    : undefined;

  const value = useMemo(
    () =>
      isDemoUser
        ? {
            isDemoUser,
            appSessionsRemaining,
            appSessionsPerMonth: DEMO_APP_SESSIONS_PER_30D,
            contactHref: "mailto:help@thenational.academy",
            isSharingEnabled,
          }
        : {
            isDemoUser,
            isSharingEnabled,
          },
    [isDemoUser, appSessionsRemaining, isSharingEnabled],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoUser(): DemoContextProps {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemoUser must be used within a DemoProvider");
  }

  return context;
}
