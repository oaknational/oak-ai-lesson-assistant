import React from "react";

const mockUser = {
  id: "user_123",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john@example.com" }],
  publicMetadata: { labs: { isDemoUser: true } },
  // Add other user properties as needed
};

export const useUser = () => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockUser,
});

export const useClerk = () => ({
  signOut: () => Promise.resolve(),
  signIn: () => Promise.resolve(),
  // Add other Clerk methods as needed
});

export const useAuth = () => ({
  isLoaded: true,
  isSignedIn: true,
  userId: mockUser.id,
  sessionId: "session_123",
  getToken: () => Promise.resolve("mock_token"),
});

export const SignedIn = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const SignedOut = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// Mock other Clerk components and hooks as needed
