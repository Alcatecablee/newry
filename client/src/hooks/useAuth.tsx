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
    if (!auth.user) return true; // Allow guest usage
    return auth.user.monthlyTransformationsUsed < auth.user.monthlyLimit;
  };

  const incrementUsage = async () => {
    if (!auth.user) return true; // Guest usage always allowed

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/auth/increment-usage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await auth.updateUser(); // Refresh user data
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to increment usage:", error);
      return false;
    }
  };

  const syncUser = async () => {
    await auth.updateUser();
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email,
          full_name: auth.user.name,
          plan_type: auth.user.planType as "free" | "pro" | "enterprise",
          monthly_transformations_used: auth.user.monthlyTransformationsUsed,
          monthly_limit: auth.user.monthlyLimit,
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
