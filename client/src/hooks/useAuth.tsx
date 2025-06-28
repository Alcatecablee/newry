import { useAuth as useSupabaseAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  plan_type: "free" | "pro" | "enterprise";
  monthly_transformations_used: number;
  monthly_limit: number;
}

export function useAuth() {
  const auth = useSupabaseAuth();

  const canUseTransformation = () => {
    if (!auth.user) return true; // Allow guest usage
    return (
      (auth.user.app_metadata?.monthly_transformations_used || 0) <
      (auth.user.app_metadata?.monthly_limit || 25)
    );
  };

  const incrementUsage = async () => {
    if (!auth.user) return true; // Guest usage always allowed

    try {
      // Update user metadata in Supabase
      const currentUsage =
        auth.user.app_metadata?.monthly_transformations_used || 0;
      const limit = auth.user.app_metadata?.monthly_limit || 25;

      if (currentUsage >= limit) {
        return false; // Usage limit reached
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...auth.user.app_metadata,
          monthly_transformations_used: currentUsage + 1,
        },
      });

      if (!error) {
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
          full_name: auth.user.user_metadata?.full_name || null,
          plan_type:
            (auth.user.app_metadata?.plan_type as
              | "free"
              | "pro"
              | "enterprise") || "free",
          monthly_transformations_used:
            auth.user.app_metadata?.monthly_transformations_used || 0,
          monthly_limit: auth.user.app_metadata?.monthly_limit || 25,
        }
      : null,
    clerkUser: auth.user, // For compatibility
    loading: auth.loading,
    signOut: auth.signOut,
    canUseTransformation,
    incrementUsage,
    syncUser,
  };
}
