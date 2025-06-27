import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Debug logging
  console.log("🔑 VITE_CLERK_PUBLISHABLE_KEY:", publishableKey);
  console.log("🔑 All env vars:", import.meta.env);

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
    <ClerkSignInButton>
      <Button variant="default" className="font-semibold">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    </ClerkSignInButton>
  );
}
