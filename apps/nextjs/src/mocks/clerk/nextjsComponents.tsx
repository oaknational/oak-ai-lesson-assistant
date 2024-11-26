import React from "react";

type Context = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  user:
    | Record<
        "id" | "firstName" | "lastName" | "emailAddresses" | "publicMetadata",
        unknown
      >
    | undefined;
};

const mockUser = {
  id: "user_123",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{ emailAddress: "john@example.com" }],
  publicMetadata: { labs: { isDemoUser: false } },
  // Add other user properties as needed
};

const states: Record<ClerkProviderProps["state"], Context> = {
  loading: {
    isLoaded: false,
    isSignedIn: undefined,
    user: undefined,
  },
  signedOut: {
    isLoaded: true,
    isSignedIn: false,
    user: undefined,
  },
  signedIn: {
    isLoaded: true,
    isSignedIn: true,
    user: mockUser,
  },
  signedInDemo: {
    isLoaded: true,
    isSignedIn: true,
    user: {
      ...mockUser,
      publicMetadata: {
        ...mockUser.publicMetadata,
        labs: { ...mockUser.publicMetadata.labs, isDemoUser: true },
      },
    },
  },
};

const ClerkContext = React.createContext<Context>(states.signedIn);

type ClerkProviderProps = {
  readonly state: "loading" | "signedIn" | "signedInDemo" | "signedOut";
  readonly children: React.ReactNode;
};
export const ClerkProvider = ({ state, children }: ClerkProviderProps) => (
  <ClerkContext.Provider value={states[state]}>
    {children}
  </ClerkContext.Provider>
);

export const useUser = () => {
  const context = React.useContext(ClerkContext);
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    user: context.user,
  };
};

export const useClerk = () => ({
  signOut: () => Promise.resolve(),
  signIn: () => Promise.resolve(),
  // Add other Clerk methods as needed
});

export const useAuth = () => {
  const context = React.useContext(ClerkContext);
  return {
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
    userId: mockUser?.id,
    sessionId: "session_123",
    getToken: () => Promise.resolve("mock_token"),
  };
};

export const SignedIn = ({ children }: { readonly children: React.ReactNode }) => {
  const context = React.useContext(ClerkContext);
  return context.isSignedIn ? children : null;
};

export const SignedOut = ({ children }: { readonly children: React.ReactNode }) => {
  const context = React.useContext(ClerkContext);
  return context.isSignedIn ? null : children;
};

export const UserButton = () => {
  const context = React.useContext(ClerkContext);

  return context.isSignedIn ? (
    <div
      style={{
        display: "block",
        height: "28px",
        width: "28px",
        background: "yellowgreen",
        borderRadius: "50%",
      }}
    />
  ) : (
    "Sign in"
  );
};

// Mock other Clerk components and hooks as needed
