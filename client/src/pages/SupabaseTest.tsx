import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Shield,
  Key,
  Users,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SupabaseTestResult {
  status: "connected" | "error";
  message: string;
  details?: any;
  timestamp?: string;
}

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [clientTest, setClientTest] = useState<any>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);

    // Test 1: Server-side test
    try {
      const response = await fetch("/api/supabase/test");
      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        status: "error",
        message: "Failed to connect to test endpoint",
      });
    }

    // Test 2: Client-side test
    try {
      const { data, error } = await supabase.auth.getSession();
      setClientTest({
        success: !error,
        hasSession: !!data.session,
        user: data.session?.user?.email || null,
        error: error?.message || null,
      });
    } catch (error: any) {
      setClientTest({
        success: false,
        error: error.message,
      });
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "border-green-500 text-green-400";
      case "error":
        return "border-red-500 text-red-400";
      default:
        return "border-yellow-500 text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Supabase Connection Test
          </h1>
          <p className="text-zinc-400">
            Testing Supabase database connection and authentication service
          </p>
        </div>

        <div className="space-y-6">
          {/* Server-side Test */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Server-side Connection Test
                {testResult && (
                  <Badge
                    variant="outline"
                    className={getStatusColor(testResult.status)}
                  >
                    {testResult.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResult.status)}
                    <span className="font-medium">{testResult.message}</span>
                  </div>

                  {testResult.details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-zinc-400 mb-1">URL</div>
                        <div className="font-mono text-xs break-all">
                          {testResult.details.url}
                        </div>
                      </div>

                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-zinc-400 mb-1">
                          Configuration
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            {testResult.details.anonKeyConfigured ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            Anon Key
                          </div>
                          <div className="flex items-center gap-2">
                            {testResult.details.serviceKeyConfigured ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-orange-500" />
                            )}
                            Service Key
                          </div>
                        </div>
                      </div>

                      {testResult.details.sessionData && (
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <div className="text-sm text-zinc-400 mb-1">
                            Session
                          </div>
                          <div className="text-xs">
                            <div>
                              Has Session:{" "}
                              {testResult.details.sessionData.hasSession
                                ? "Yes"
                                : "No"}
                            </div>
                            {testResult.details.sessionData.user && (
                              <div>
                                User: {testResult.details.sessionData.user}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {testResult.details.serviceKeyTest && (
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <div className="text-sm text-zinc-400 mb-1">
                            Admin Access
                          </div>
                          <div className="text-xs">
                            <div className="flex items-center gap-2">
                              {testResult.details.serviceKeyTest.working ? (
                                <CheckCircle className="w-3 h-3 text-zinc-400" />
                              ) : (
                                <XCircle className="w-3 h-3 text-zinc-400" />
                              )}
                              Service Key Working
                            </div>
                            {testResult.details.serviceKeyTest.userCount !==
                              undefined && (
                              <div>
                                Users:{" "}
                                {testResult.details.serviceKeyTest.userCount}
                              </div>
                            )}
                            {testResult.details.serviceKeyTest.error && (
                              <div className="text-red-400">
                                Error: {testResult.details.serviceKeyTest.error}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {testResult.timestamp && (
                    <div className="text-xs text-zinc-500">
                      Tested at:{" "}
                      {new Date(testResult.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-400">Running server-side test...</div>
              )}
            </CardContent>
          </Card>

          {/* Client-side Test */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Client-side Connection Test
                {clientTest && (
                  <Badge
                    variant="outline"
                    className={
                      clientTest.success
                        ? "border-green-500 text-green-400"
                        : "border-red-500 text-red-400"
                    }
                  >
                    {clientTest.success ? "success" : "error"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientTest ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {clientTest.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {clientTest.success
                        ? "Client connection successful"
                        : "Client connection failed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="text-sm text-zinc-400 mb-1">
                        Session Status
                      </div>
                      <div className="text-xs">
                        <div>
                          Has Session: {clientTest.hasSession ? "Yes" : "No"}
                        </div>
                        {clientTest.user && <div>User: {clientTest.user}</div>}
                      </div>
                    </div>

                    {clientTest.error && (
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm text-zinc-400 mb-1">Error</div>
                        <div className="text-xs text-red-400">
                          {clientTest.error}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-zinc-400">Running client-side test...</div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={runTests} disabled={testing} variant="outline">
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Re-test Connection
            </Button>

            <Button
              onClick={() =>
                window.open(
                  "https://jetwhffgmohdqkuegtjh.supabase.co",
                  "_blank",
                )
              }
              variant="outline"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </Button>

            <Button
              onClick={() => (window.location.href = "/admin")}
              className="bg-white text-black hover:bg-gray-100"
            >
              <Key className="w-4 h-4 mr-2" />
              Go to Admin Dashboard
            </Button>
          </div>

          {/* Summary */}
          <Alert
            className={`${testResult?.status === "connected" && clientTest?.success ? "border-green-500 bg-green-500/10" : "border-orange-500 bg-orange-500/10"}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {testResult?.status === "connected" && clientTest?.success ? (
                <span className="text-green-400">
                  ✅ Supabase is properly connected and ready to use! You can
                  now sign up and use authentication.
                </span>
              ) : (
                <span className="text-orange-400">
                  ⚠️ There may be issues with the Supabase connection. Check the
                  details above and verify your configuration.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
