import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Test Supabase connection
router.get("/api/supabase/test", async (req, res) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(400).json({
        status: "error",
        message: "Supabase credentials not configured",
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey,
        },
      });
    }

    // Test with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to get session (this should work even if no user is logged in)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    // Test service key if available
    let serviceKeyTest = null;
    if (supabaseServiceKey) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: users, error: usersError } =
          await adminClient.auth.admin.listUsers();
        serviceKeyTest = {
          working: !usersError,
          userCount: users?.users?.length || 0,
          error: usersError?.message || null,
        };
      } catch (err) {
        serviceKeyTest = {
          working: false,
          error: err.message,
        };
      }
    }

    res.json({
      status: "connected",
      message: "Supabase connection successful",
      details: {
        url: supabaseUrl,
        anonKeyConfigured: true,
        serviceKeyConfigured: !!supabaseServiceKey,
        sessionData: {
          hasSession: !!data.session,
          user: data.session?.user?.email || null,
        },
        serviceKeyTest,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Supabase test error:", error);
    res.status(500).json({
      status: "error",
      message: "Supabase test failed",
      error: error.message,
    });
  }
});

export default router;
