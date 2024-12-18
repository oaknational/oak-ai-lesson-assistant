import { useMemo } from "react";

import { useUser } from "@clerk/nextjs";
import { addBreadcrumb } from "@sentry/nextjs";

type User = ReturnType<typeof useUser>["user"];

type UseClerkDemoMetadataReturn =
  | {
      isSet: true;
      userType: "Demo" | "Full";
    }
  | {
      isSet: false;
      userType: undefined;
    };

type LabsUser = User & {
  publicMetadata: {
    labs?: {
      isDemoUser?: boolean;
      isOnboarded?: boolean;
    };
  };
};

type UserWithDemoStatus = User & {
  publicMetadata: {
    labs: {
      isDemoUser: boolean;
    };
  };
};

export function isDemoStatusSet(user: LabsUser): user is UserWithDemoStatus {
  const labsMetadata = user.publicMetadata.labs ?? {};
  return "isDemoUser" in labsMetadata;
}

function getResult(
  user: ReturnType<typeof useUser>,
): UseClerkDemoMetadataReturn {
  // Feature disabled, all users have full access
  if (process.env.NEXT_PUBLIC_DEMO_ACCOUNTS_ENABLED !== "true") {
    return {
      isSet: true,
      userType: "Full",
    };
  }

  // User is logged out, not applicable
  if (!user.isSignedIn) {
    return {
      isSet: false,
      userType: undefined,
    };
  }

  // User is logged in, but has not completed onboarding
  if (!isDemoStatusSet(user.user)) {
    addBreadcrumb({ message: "User demo status is unknown" });
    return {
      isSet: false,
      userType: undefined,
    };
  }

  // User is logged in and has completed onboarding
  return {
    isSet: true,
    userType: user.user.publicMetadata.labs.isDemoUser ? "Demo" : "Full",
  };
}

export function useClerkDemoMetadata(): UseClerkDemoMetadataReturn {
  const user = useUser();

  const result = useMemo(() => getResult(user), [user]);
  return result;
}
