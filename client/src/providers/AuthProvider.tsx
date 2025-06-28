import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { supabase, type User, type AuthError } from "@/lib/supabase";
import type {
  AuthError as SupabaseAuthError,
  User as SupabaseUser,
} from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await updateUserProfile(session.user);
      }

      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await updateUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Sync user with our database
      await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: supabaseUser.id,
          email: supabaseUser.email,
          user_metadata: supabaseUser.user_metadata,
        }),
      });

      // Map Supabase user to our User type
      const mappedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        user_metadata: {
          full_name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0],
          avatar_url: supabaseUser.user_metadata?.avatar_url,
        },
        app_metadata: {
          plan_type: supabaseUser.app_metadata?.plan_type || "free",
          monthly_transformations_used:
            supabaseUser.app_metadata?.monthly_transformations_used || 0,
          monthly_limit: supabaseUser.app_metadata?.monthly_limit || 25,
        },
      };

      setUser(mappedUser);
    } catch (error) {
      console.error("Failed to sync user with database:", error);
      // Still set the user even if sync fails
      const mappedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        user_metadata: {
          full_name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0],
          avatar_url: supabaseUser.user_metadata?.avatar_url,
        },
        app_metadata: {
          plan_type: supabaseUser.app_metadata?.plan_type || "free",
          monthly_transformations_used:
            supabaseUser.app_metadata?.monthly_transformations_used || 0,
          monthly_limit: supabaseUser.app_metadata?.monthly_limit || 25,
        },
      };
      setUser(mappedUser);
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await updateUserProfile(data.user);
        return { success: true };
      }

      return { success: false, error: "Sign in failed" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            plan_type: "free",
            monthly_transformations_used: 0,
            monthly_limit: 25,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // User will be updated via onAuthStateChange
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const updateUser = async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      await updateUserProfile(supabaseUser);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
