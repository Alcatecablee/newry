import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://jetwhffgmohdqkuegtjh.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHdoZmZnbW9oZHFrdWVndGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzI0MjcsImV4cCI6MjA2NDY0ODQyN30.qdzOYox4XJQIadJlkg52bWjM1BGJd848ru0kobNmxiA";

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
