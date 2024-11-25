import { createContext, useContext, useMemo } from "react";

import { useClerkDemoMetadata } from "hooks/useClerkDemoMetadata";

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

export const DemoContext = createContext<DemoContextProps | null>(null);

export type DemoProviderProps = Readonly<{ children: React.ReactNode }>;

export function DemoProvider({ children }: Readonly<DemoProviderProps>) {
  const clerkMetadata = useClerkDemoMetadata();
  const isDemoUser = !clerkMetadata.isSet || clerkMetadata.userType === "Demo";

  const remainingAppSessions = trpc.chat.appSessions.remainingLimit.useQuery(
    undefined,
    { enabled: clerkMetadata.isSet && isDemoUser },
  );

  const isSharingEnabled =
    !isDemoUser || process.env.NEXT_PUBLIC_DEMO_SHARING_ENABLED === "true";

  const appSessionsRemaining = remainingAppSessions.isSuccess
    ? remainingAppSessions.data.remaining
    : undefined;

  const value: DemoContextProps = useMemo(
    () =>
      isDemoUser
        ? {
            isDemoUser,
            appSessionsRemaining,
            appSessionsPerMonth: DEMO_APP_SESSIONS_PER_30D,
            contactHref:
              "https://share.hsforms.com/1R9ulYSNPQgqElEHde3KdhAbvumd",
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
