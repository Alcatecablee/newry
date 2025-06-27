import { ClerkProvider as ClerkAuthProvider } from "@clerk/clerk-react";
import { ReactNode } from "react";

interface ClerkProviderProps {
  children: ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  const publishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Z3VpZGluZy1haXJlZGFsZS00My5jbGVyay5hY2NvdW50cy5kZXYk";

  // If no Clerk key is provided, render children without Clerk provider
  if (!publishableKey) {
    if (import.meta.env.DEV) {
      console.info(
        "💡 VITE_CLERK_PUBLISHABLE_KEY is not set. Authentication features are disabled. Add your Clerk key to .env to enable auth.",
      );
    }
    return <>{children}</>;
  }

  // Get current URL for redirects
  const currentUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <ClerkAuthProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#7c3aed",
        },
      }}
      signInFallbackRedirectUrl={currentUrl + "/app"}
      signUpFallbackRedirectUrl={currentUrl + "/app"}
      afterSignInUrl={currentUrl + "/app"}
      afterSignUpUrl={currentUrl + "/app"}
    >
      {children}
    </ClerkAuthProvider>
  );
}
