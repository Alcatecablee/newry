import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import {
  Settings,
  Key,
  Database,
  CreditCard,
  Server,
  Check,
  X,
  Copy,
  RefreshCw,
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_ENVIRONMENT: string;
  API_URL: string;
}

interface SystemStatus {
  supabase: "connected" | "disconnected" | "error";
  database: "connected" | "disconnected" | "memory";
  paypal: "connected" | "disconnected" | "error";
  server: "running" | "error";
}

const AdminDashboard = () => {
  const [envConfig, setEnvConfig] = useState<EnvConfig>({
    VITE_SUPABASE_URL: "",
    VITE_SUPABASE_ANON_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    DATABASE_URL: "",
    PAYPAL_CLIENT_ID: "",
    PAYPAL_CLIENT_SECRET: "",
    PAYPAL_ENVIRONMENT: "sandbox",
    API_URL: "",
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    supabase: "disconnected",
    database: "memory",
    paypal: "disconnected",
    server: "running",
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<keyof SystemStatus | null>(null);
  const [showServiceKey, setShowServiceKey] = useState(false);

  useEffect(() => {
    loadEnvironmentVariables();
    checkSystemStatus();
  }, []);

  const loadEnvironmentVariables = async () => {
    try {
      // Load from environment variables
      setEnvConfig({
        VITE_SUPABASE_URL:
          import.meta.env.VITE_SUPABASE_URL ||
          "https://jetwhffgmohdqkuegtjh.supabase.co",
        VITE_SUPABASE_ANON_KEY:
          import.meta.env.VITE_SUPABASE_ANON_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldHdoZmZnbW9oZHFrdWVndGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzI0MjcsImV4cCI6MjA2NDY0ODQyN30.qdzOYox4XJQIadJlkg52bWjM1BGJd848ru0kobNmxiA",
        SUPABASE_SERVICE_ROLE_KEY:
          import.meta.env.SUPABASE_SERVICE_ROLE_KEY || "",
        DATABASE_URL: import.meta.env.DATABASE_URL || "",
        PAYPAL_CLIENT_ID: import.meta.env.PAYPAL_CLIENT_ID || "",
        PAYPAL_CLIENT_SECRET: import.meta.env.PAYPAL_CLIENT_SECRET || "",
        PAYPAL_ENVIRONMENT: import.meta.env.PAYPAL_ENVIRONMENT || "sandbox",
        API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
      });
    } catch (error) {
      console.error("Failed to load environment variables:", error);
    }
  };

  const checkSystemStatus = async () => {
    // Check Supabase status
    setSystemStatus((prev) => ({
      ...prev,
      supabase:
        envConfig.VITE_SUPABASE_URL && envConfig.VITE_SUPABASE_ANON_KEY
          ? "connected"
          : "disconnected",
    }));

    // Check database status
    try {
      const response = await fetch("/api/db/test");
      const data = await response.json();
      setSystemStatus((prev) => ({
        ...prev,
        database: data.status === "connected" ? "connected" : "memory",
      }));
    } catch (error) {
      setSystemStatus((prev) => ({ ...prev, database: "memory" }));
    }

    // Check PayPal status
    setSystemStatus((prev) => ({
      ...prev,
      paypal: envConfig.PAYPAL_CLIENT_ID ? "connected" : "disconnected",
    }));
  };

  const testConnection = async (service: keyof SystemStatus) => {
    setTesting(service);
    try {
      switch (service) {
        case "supabase":
          // Test Supabase connection
          if (envConfig.VITE_SUPABASE_URL && envConfig.VITE_SUPABASE_ANON_KEY) {
            const { createClient } = await import("@supabase/supabase-js");
            const testClient = createClient(
              envConfig.VITE_SUPABASE_URL,
              envConfig.VITE_SUPABASE_ANON_KEY,
            );

            // Test auth session
            const { data, error } = await testClient.auth.getSession();
            if (error) throw error;

            setSystemStatus((prev) => ({ ...prev, supabase: "connected" }));
            toast({
              title: "Supabase connection successful",
              description: "Authentication service is now enabled",
            });
          } else {
            throw new Error("Supabase URL and Anon Key are required");
          }
          break;

        case "database":
          const dbResponse = await fetch("/api/db/test");
          if (dbResponse.ok) {
            const data = await dbResponse.json();
            setSystemStatus((prev) => ({
              ...prev,
              database: data.status === "connected" ? "connected" : "memory",
            }));
            toast({
              title: "Database connection successful",
              description: `Database type: ${data.type || "SQLite"}`,
            });
          } else {
            throw new Error("Database connection failed");
          }
          break;

        case "paypal":
          if (!envConfig.PAYPAL_CLIENT_ID) {
            throw new Error("PayPal client ID is required");
          }
          // Simplified PayPal test
          setSystemStatus((prev) => ({ ...prev, paypal: "connected" }));
          toast({ title: "PayPal configuration updated" });
          break;

        case "server":
          const serverResponse = await fetch("/api/health");
          if (serverResponse.ok) {
            setSystemStatus((prev) => ({ ...prev, server: "running" }));
            toast({ title: "Server is running normally" });
          } else {
            throw new Error("Server health check failed");
          }
          break;
      }
    } catch (error: any) {
      setSystemStatus((prev) => ({ ...prev, [service]: "error" }));
      toast({
        title: `${service} test failed`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Save environment variables to backend
      const response = await fetch("/api/admin/save-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          envVars: {
            VITE_SUPABASE_URL: envConfig.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: envConfig.VITE_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: envConfig.SUPABASE_SERVICE_ROLE_KEY,
            DATABASE_URL: envConfig.DATABASE_URL,
            PAYPAL_CLIENT_ID: envConfig.PAYPAL_CLIENT_ID,
            PAYPAL_CLIENT_SECRET: envConfig.PAYPAL_CLIENT_SECRET,
            PAYPAL_ENVIRONMENT: envConfig.PAYPAL_ENVIRONMENT,
            API_URL: envConfig.API_URL,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Configuration saved successfully!",
          description:
            "Environment variables written to .env file. Refreshing page to apply changes...",
        });

        // Refresh the page to reload with new env vars
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(result.message || "Save failed");
      }

      checkSystemStatus();
    } catch (error: any) {
      toast({
        title: "❌ Save failed",
        description: error.message || "Could not save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: SystemStatus[keyof SystemStatus]) => {
    switch (status) {
      case "connected":
      case "running":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: SystemStatus[keyof SystemStatus]) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "running":
        return "Running";
      case "disconnected":
        return "Disconnected";
      case "memory":
        return "In-Memory";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <PageHeader
          title="Admin Dashboard"
          description="Configure and monitor NeuroLint system settings"
          className="mb-8"
          breadcrumb={{
            items: [
              { label: "Home", href: "/" },
              { label: "Admin Dashboard", href: "/admin" },
            ],
          }}
          cta={{
            label: "Try NeuroLint",
            href: "/app",
          }}
        />

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Supabase Auth</p>
                  <p className="text-lg font-semibold">
                    {getStatusText(systemStatus.supabase)}
                  </p>
                </div>
                {getStatusIcon(systemStatus.supabase)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Database</p>
                  <p className="text-lg font-semibold">
                    {getStatusText(systemStatus.database)}
                  </p>
                </div>
                {getStatusIcon(systemStatus.database)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">PayPal</p>
                  <p className="text-lg font-semibold">
                    {getStatusText(systemStatus.paypal)}
                  </p>
                </div>
                {getStatusIcon(systemStatus.paypal)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Server</p>
                  <p className="text-lg font-semibold">
                    {getStatusText(systemStatus.server)}
                  </p>
                </div>
                {getStatusIcon(systemStatus.server)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tabs */}
        <Tabs defaultValue="supabase" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger
              value="supabase"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              Supabase Auth
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Server className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supabase" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Supabase Authentication Configuration
                  <Badge
                    variant="outline"
                    className={
                      systemStatus.supabase === "connected"
                        ? "border-green-500 text-green-400"
                        : "border-yellow-500 text-yellow-400"
                    }
                  >
                    {getStatusText(systemStatus.supabase)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Configure your Supabase project credentials. You can find
                    these in your Supabase project dashboard under Settings →
                    API.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="supabase-url">Supabase URL</Label>
                    <Input
                      id="supabase-url"
                      placeholder="https://your-project.supabase.co"
                      value={envConfig.VITE_SUPABASE_URL}
                      onChange={(e) =>
                        setEnvConfig((prev) => ({
                          ...prev,
                          VITE_SUPABASE_URL: e.target.value,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supabase-anon-key">Supabase Anon Key</Label>
                    <Input
                      id="supabase-anon-key"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={envConfig.VITE_SUPABASE_ANON_KEY}
                      onChange={(e) =>
                        setEnvConfig((prev) => ({
                          ...prev,
                          VITE_SUPABASE_ANON_KEY: e.target.value,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="supabase-service-key">
                      Supabase Service Role Key (Optional)
                    </Label>
                    <Input
                      id="supabase-service-key"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={envConfig.SUPABASE_SERVICE_ROLE_KEY}
                      onChange={(e) =>
                        setEnvConfig((prev) => ({
                          ...prev,
                          SUPABASE_SERVICE_ROLE_KEY: e.target.value,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                      type="password"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Only needed for admin operations. Keep this secret!
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection("supabase")}
                    disabled={testing === "supabase"}
                    variant="outline"
                  >
                    {testing === "supabase" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Configuration
                  <Badge
                    variant="outline"
                    className={
                      systemStatus.database === "connected"
                        ? "border-green-500 text-green-400"
                        : "border-yellow-500 text-yellow-400"
                    }
                  >
                    {getStatusText(systemStatus.database)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Currently using SQLite for local development. For
                    production, configure a PostgreSQL connection string.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="database-url">
                    Database URL (Optional - PostgreSQL)
                  </Label>
                  <Input
                    id="database-url"
                    placeholder="postgresql://user:password@localhost:5432/neurolint"
                    value={envConfig.DATABASE_URL}
                    onChange={(e) =>
                      setEnvConfig((prev) => ({
                        ...prev,
                        DATABASE_URL: e.target.value,
                      }))
                    }
                    className="bg-zinc-800 border-zinc-700 text-white"
                    type="password"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection("database")}
                    disabled={testing === "database"}
                    variant="outline"
                  >
                    {testing === "database" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  PayPal Configuration
                  <Badge
                    variant="outline"
                    className={
                      systemStatus.paypal === "connected"
                        ? "border-green-500 text-green-400"
                        : "border-yellow-500 text-yellow-400"
                    }
                  >
                    {getStatusText(systemStatus.paypal)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                    <Input
                      id="paypal-client-id"
                      placeholder="AeB1QIZpYxkTKo9mGDvH8..."
                      value={envConfig.PAYPAL_CLIENT_ID}
                      onChange={(e) =>
                        setEnvConfig((prev) => ({
                          ...prev,
                          PAYPAL_CLIENT_ID: e.target.value,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paypal-client-secret">
                      PayPal Client Secret
                    </Label>
                    <Input
                      id="paypal-client-secret"
                      placeholder="EJNnVztjR8sWdmMUIe..."
                      value={envConfig.PAYPAL_CLIENT_SECRET}
                      onChange={(e) =>
                        setEnvConfig((prev) => ({
                          ...prev,
                          PAYPAL_CLIENT_SECRET: e.target.value,
                        }))
                      }
                      className="bg-zinc-800 border-zinc-700 text-white"
                      type="password"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paypal-environment">Environment</Label>
                  <select
                    id="paypal-environment"
                    value={envConfig.PAYPAL_ENVIRONMENT}
                    onChange={(e) =>
                      setEnvConfig((prev) => ({
                        ...prev,
                        PAYPAL_ENVIRONMENT: e.target.value,
                      }))
                    }
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection("paypal")}
                    disabled={testing === "paypal"}
                    variant="outline"
                  >
                    {testing === "paypal" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Test Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-url">API URL</Label>
                  <Input
                    id="api-url"
                    placeholder="http://localhost:5000"
                    value={envConfig.API_URL}
                    onChange={(e) =>
                      setEnvConfig((prev) => ({
                        ...prev,
                        API_URL: e.target.value,
                      }))
                    }
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testConnection("server")}
                    disabled={testing === "server"}
                    variant="outline"
                  >
                    {testing === "server" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Server className="w-4 h-4 mr-2" />
                    )}
                    Test Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card className="bg-zinc-900 border-zinc-800 mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Save Configuration</h3>
                <p className="text-sm text-zinc-400">
                  Save all environment variables to .env file
                </p>
              </div>
              <Button
                onClick={saveConfiguration}
                disabled={saving}
                className="bg-white text-black hover:bg-gray-100"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
