import { useRef, useEffect } from "react";

import { useUser, useAuth } from "#clerk/nextjs";

import { useDemoUser } from "@/components/ContextProviders/Demo";

type UseClerkIdentifyProps = {
  /**
   * Callback to identify the user with a service.
   * Should be stable across renders.
   */
  onIdentify: (user: {
    userId: string;
    email: string;
    isDemoUser: boolean;
  }) => void;
  /**
   * Callback to reset the user when the user is logged out.
   * Should be stable across renders.
   */
  onLogout: () => void;
};
/**
 * This hook provider callbacks to identify the user with a service, and reset
 * when the user is logged in/out.
 */
export const useClerkIdentify = ({
  onIdentify,
  onLogout,
}: UseClerkIdentifyProps) => {
  const user = useUser();
  const auth = useAuth();
  const demo = useDemoUser();
  const hasIdentified = useRef(false);

  const userId = auth.userId;
  const email = user.user?.primaryEmailAddress?.emailAddress;

  const hasUser = userId && email;
  const hasLoggedOut = !hasUser && hasIdentified.current;

  useEffect(() => {
    if (hasUser) {
      onIdentify({
        userId,
        email,
        isDemoUser: demo.isDemoUser,
      });
      hasIdentified.current = true;
    } else if (hasLoggedOut) {
      onLogout();
      hasIdentified.current = false;
    }
  }, [hasUser, hasLoggedOut, userId, email, onIdentify, onLogout, demo]);
};
