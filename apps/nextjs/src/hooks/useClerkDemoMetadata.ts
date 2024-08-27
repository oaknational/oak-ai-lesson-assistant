import { useMemo } from "react";

import { useUser } from "#clerk/nextjs";

type UseClerkDemoMetadataReturn =
  | {
      isSet: true;
      userType: "Demo" | "Full";
    }
  | {
      isSet: false;
      userType: undefined;
    };

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
  if (!("isDemoUser" in user.user.publicMetadata)) {
    console.warn("User demo status is unknown");
    return {
      isSet: false,
      userType: undefined,
    };
  }

  // User is logged in and has completed onboarding
  return {
    isSet: true,
    userType: Boolean(user.user.publicMetadata.isDemoUser) ? "Demo" : "Full",
  };
}

export function useClerkDemoMetadata(): UseClerkDemoMetadataReturn {
  const user = useUser();

  const result = useMemo(() => getResult(user), [user]);
  return result;
}
