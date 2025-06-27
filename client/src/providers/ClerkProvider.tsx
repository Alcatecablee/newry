import { ClerkProvider as ClerkAuthProvider } from "@clerk/clerk-react";
import { ReactNode } from "react";

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // If no Clerk key is provided, render children without Clerk provider
  if (!publishableKey) {
    if (import.meta.env.DEV) {
      console.info(
        "💡 VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication features are disabled. Add your Clerk key to .env to enable auth.",
      );
    }
    return <>{children}</>;
  }

  return (
    <ClerkAuthProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#7c3aed",
        },
      }}
    >
      {children}
    </ClerkAuthProvider>
  );
}
