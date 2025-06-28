import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jetwhffgmohdqkuegtjh.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHdoZmZnbW9oZHFrdWVndGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzEwMjEsImV4cCI6MjA1MTI0NzAyMX0.k2YmPrFDvBnSe_5mH96VlnGhVgP8QOPkjX-Bwdg9-Y8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    plan_type?: string;
    monthly_transformations_used?: number;
    monthly_limit?: number;
  };
};

export type AuthError = {
  message: string;
  status?: number;
};
