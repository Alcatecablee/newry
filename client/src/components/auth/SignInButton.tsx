import { SignInButton as ClerkSignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  const publishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Z3VpZGluZy1haXJlZGFsZS00My5jbGVyay5hY2NvdW50cy5kZXYk";

  console.log(
    "🔐 SignInButton rendering, publishableKey:",
    publishableKey ? publishableKey.slice(0, 20) + "..." : "NONE",
  );

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
