import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface UserData {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  plan_type: "free" | "pro" | "enterprise";
  monthly_transformations_used: number;
  monthly_limit: number;
}

export function useAuth() {
  const publishableKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Z3VpZGluZy1haXJlZGFsZS00My5jbGVyay5hY2NvdW50cy5kZXYk";

  console.log(
    "🔐 useAuth loading, publishableKey:",
    publishableKey ? publishableKey.slice(0, 20) + "..." : "NONE",
  );

  // Only use Clerk hooks if the key is available
  const clerkUser = publishableKey
    ? useUser()
    : { isSignedIn: false, user: null };
  const clerkAuth = publishableKey
    ? useClerkAuth()
    : { signOut: () => Promise.resolve() };

  const { isSignedIn, user } = clerkUser;
  const { signOut } = clerkAuth;

  console.log("🔐 useAuth state:", {
    isSignedIn,
    hasUser: !!user,
    publishableKeyExists: !!publishableKey,
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publishableKey) {
      setLoading(false);
      return;
    }

    if (isSignedIn && user) {
      syncUser();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [isSignedIn, user, publishableKey]);

  const syncUser = async () => {
    if (!user) return;

    try {
      // First, try to get existing user
      const response = await fetch(`/api/user/${user.id}`);

      if (response.ok) {
        const existingUser = await response.json();
        setUserData(existingUser as UserData);
      } else if (response.status === 404) {
        // Create new user
        const createResponse = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            fullName: user.fullName,
          }),
        });

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          setUserData(newUser as UserData);
        } else {
          console.error("Error creating user");
          toast({
            title: "Error",
            description: "Failed to create user account",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error syncing user:", error);
    } finally {
      setLoading(false);
    }
  };

  const canUseTransformation = () => {
    if (!userData) return true; // Allow usage when not authenticated
    if (userData.plan_type !== "free") return true;
    return userData.monthly_transformations_used < userData.monthly_limit;
  };

  const incrementUsage = async () => {
    if (!user) return false;

    try {
      const response = await fetch("/api/increment-usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
        }),
      });

      if (response.ok) {
        const { success } = await response.json();
        if (success) {
          // Refresh user data
          syncUser();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error incrementing usage:", error);
      return false;
    }
  };

  return {
    isAuthenticated: publishableKey ? isSignedIn : false,
    user: userData,
    clerkUser: user,
    loading,
    signOut,
    canUseTransformation,
    incrementUsage,
    syncUser,
  };
}
