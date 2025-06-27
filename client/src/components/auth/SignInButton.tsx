import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  // Hardcoded for immediate functionality - will fix env vars after
  const publishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Z3VpZGluZy1haXJlZGFsZS00My5jbGVyay5hY2NvdW50cy5kZXYk";

  // If no Clerk key is available, render a disabled button
  if (!publishableKey) {
    return (
      <Button
        disabled
        variant="default"
        className="font-semibold opacity-50"
        title="Authentication is disabled. Set VITE_CLERK_PUBLISHABLE_KEY to enable."
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In (Disabled)
      </Button>
    );
  }

  return (
    <ClerkSignInButton mode="redirect">
      <Button variant="default" className="font-semibold">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
