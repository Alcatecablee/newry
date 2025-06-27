import { useAuth as useLocalAuth } from "@/providers/ClerkProvider";

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: "free" | "pro" | "enterprise";
  monthly_transformations_used: number;
  monthly_limit: number;
}

export function useAuth() {
  const auth = useLocalAuth();

  const canUseTransformation = () => {
    // For demo purposes, always allow transformations
    return true;
  };

  const incrementUsage = async () => {
    // For demo purposes, always return success
    return true;
  };

  const syncUser = async () => {
    // No-op for local auth
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email,
          full_name: auth.user.name,
          plan_type: "free" as const,
          monthly_transformations_used: 0,
          monthly_limit: 100,
        }
      : null,
    clerkUser: auth.user,
    loading: auth.loading,
    signOut: auth.signOut,
    canUseTransformation,
    incrementUsage,
    syncUser,
  };
}
