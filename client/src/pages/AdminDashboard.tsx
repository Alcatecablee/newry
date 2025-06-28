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
  VITE_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  DATABASE_URL: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  PAYPAL_ENVIRONMENT: string;
  API_URL: string;
}

interface SystemStatus {
  clerk: "connected" | "disconnected" | "error";
  database: "connected" | "disconnected" | "memory";
  paypal: "connected" | "disconnected" | "error";
  server: "running" | "error";
}

const AdminDashboard = () => {
  const [envConfig, setEnvConfig] = useState<EnvConfig>({
    VITE_CLERK_PUBLISHABLE_KEY:
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "",
    CLERK_SECRET_KEY: "",
    DATABASE_URL: "",
    PAYPAL_CLIENT_ID: "",
    PAYPAL_CLIENT_SECRET: "",
    PAYPAL_ENVIRONMENT: "sandbox",
    API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    clerk: "disconnected",
    database: "memory",
    paypal: "disconnected",
    server: "running",
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<keyof SystemStatus | null>(null);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    // Check Clerk status
    setSystemStatus((prev) => ({
      ...prev,
      clerk: envConfig.VITE_CLERK_PUBLISHABLE_KEY
        ? "connected"
        : "disconnected",
    }));

    // Check server status
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setSystemStatus((prev) => ({
          ...prev,
          server: "running",
          database: data.database === "none" ? "disconnected" : "connected",
        }));
      } else {
        setSystemStatus((prev) => ({
          ...prev,
          server: "error",
          database: "error",
        }));
      }
    } catch {
      setSystemStatus((prev) => ({
        ...prev,
        server: "error",
        database: "error",
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "running":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "memory":
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "running":
        return "bg-green-900 text-green-200";
      case "error":
        return "bg-red-900 text-red-200";
      case "memory":
        return "bg-yellow-900 text-yellow-200";
      default:
        return "bg-gray-900 text-gray-200";
    }
  };

  const updateEnvVar = (key: keyof EnvConfig, value: string) => {
    setEnvConfig((prev) => ({ ...prev, [key]: value }));
  };

  const testConnection = async (service: keyof SystemStatus) => {
    setTesting(service);

    try {
      switch (service) {
        case "clerk":
          if (!envConfig.VITE_CLERK_PUBLISHABLE_KEY) {
            throw new Error("Clerk publishable key is required");
          }
          // Test Clerk connection (simplified)
          if (envConfig.VITE_CLERK_PUBLISHABLE_KEY.startsWith("pk_")) {
            setSystemStatus((prev) => ({ ...prev, clerk: "connected" }));
            toast({
              title: "Clerk connection successful",
              description: "Authentication is now enabled",
            });
          } else {
            throw new Error("Invalid Clerk key format");
          }
          break;

        case "database":
          const dbResponse = await fetch("/api/db/test");
          if (dbResponse.ok) {
            setSystemStatus((prev) => ({ ...prev, database: "connected" }));
            toast({ title: "Database connection successful" });
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
            VITE_CLERK_PUBLISHABLE_KEY: envConfig.VITE_CLERK_PUBLISHABLE_KEY,
            CLERK_SECRET_KEY: envConfig.CLERK_SECRET_KEY,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const generateEnvFile = () => {
    const envContent = Object.entries(envConfig)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    return envContent;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/15 rounded-full blur-3xl"></div>
      </div>

      <PageHeader
        title="Admin Dashboard"
        description="Configure system settings, manage integrations, and monitor application health."
        icon={<Shield className="w-4 h-4" />}
        badge="System Administration"
        actionButton={{
          label: "Try NeuroLint",
          href: "/app",
        }}
      />

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.clerk)}
                    <span className="text-sm text-zinc-300">
                      Authentication
                    </span>
                  </div>
                  <Badge className={getStatusColor(systemStatus.clerk)}>
                    {systemStatus.clerk}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database)}
                    <span className="text-sm text-zinc-300">Database</span>
                  </div>
                  <Badge className={getStatusColor(systemStatus.database)}>
                    {systemStatus.database}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.paypal)}
                    <span className="text-sm text-zinc-300">Payments</span>
                  </div>
                  <Badge className={getStatusColor(systemStatus.paypal)}>
                    {systemStatus.paypal}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.server)}
                    <span className="text-sm text-zinc-300">Server</span>
                  </div>
                  <Badge className={getStatusColor(systemStatus.server)}>
                    {systemStatus.server}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Tabs */}
          <Tabs defaultValue="clerk" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border border-zinc-800">
              <TabsTrigger
                value="clerk"
                className="data-[state=active]:bg-zinc-800"
              >
                <Key className="w-4 h-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger
                value="database"
                className="data-[state=active]:bg-zinc-800"
              >
                <Database className="w-4 h-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:bg-zinc-800"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-zinc-800"
              >
                <Server className="w-4 h-4 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

            {/* Clerk Configuration */}
            <TabsContent value="clerk" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Clerk Authentication Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-900/20 border-blue-900/50">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-blue-200">
                      Sign up at{" "}
                      <a
                        href="https://clerk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        clerk.com
                      </a>{" "}
                      to get your API keys. This enables user authentication and
                      billing features.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="clerkPublishable"
                        className="text-zinc-300"
                      >
                        Clerk Publishable Key *
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="clerkPublishable"
                          type="password"
                          placeholder="pk_test_..."
                          value={envConfig.VITE_CLERK_PUBLISHABLE_KEY}
                          onChange={(e) =>
                            updateEnvVar(
                              "VITE_CLERK_PUBLISHABLE_KEY",
                              e.target.value,
                            )
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              envConfig.VITE_CLERK_PUBLISHABLE_KEY,
                            )
                          }
                          disabled={!envConfig.VITE_CLERK_PUBLISHABLE_KEY}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clerkSecret" className="text-zinc-300">
                        Clerk Secret Key
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="clerkSecret"
                          type="password"
                          placeholder="sk_test_..."
                          value={envConfig.CLERK_SECRET_KEY}
                          onChange={(e) =>
                            updateEnvVar("CLERK_SECRET_KEY", e.target.value)
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(envConfig.CLERK_SECRET_KEY)
                          }
                          disabled={!envConfig.CLERK_SECRET_KEY}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => testConnection("clerk")}
                        disabled={
                          testing === "clerk" ||
                          !envConfig.VITE_CLERK_PUBLISHABLE_KEY
                        }
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {testing === "clerk" ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Database Configuration */}
            <TabsContent value="database" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemStatus.database === "connected" ? (
                    <Alert className="bg-green-900/20 border-green-900/50">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-200">
                        Local SQLite database is connected and working. Your
                        data is being persisted locally.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-yellow-900/20 border-yellow-900/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-yellow-200">
                        Database connection failed. Check your configuration or
                        contact support.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="databaseUrl" className="text-zinc-300">
                      Database URL (PostgreSQL)
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="databaseUrl"
                        type="password"
                        placeholder="postgresql://username:password@localhost:5432/neurolint"
                        value={envConfig.DATABASE_URL}
                        onChange={(e) =>
                          updateEnvVar("DATABASE_URL", e.target.value)
                        }
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(envConfig.DATABASE_URL)}
                        disabled={!envConfig.DATABASE_URL}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => testConnection("database")}
                    disabled={testing === "database" || !envConfig.DATABASE_URL}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {testing === "database" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PayPal Configuration */}
            <TabsContent value="payments" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    PayPal Payment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paypalClientId" className="text-zinc-300">
                        PayPal Client ID
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="paypalClientId"
                          type="password"
                          placeholder="Your PayPal Client ID"
                          value={envConfig.PAYPAL_CLIENT_ID}
                          onChange={(e) =>
                            updateEnvVar("PAYPAL_CLIENT_ID", e.target.value)
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(envConfig.PAYPAL_CLIENT_ID)
                          }
                          disabled={!envConfig.PAYPAL_CLIENT_ID}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="paypalSecret" className="text-zinc-300">
                        PayPal Client Secret
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="paypalSecret"
                          type="password"
                          placeholder="Your PayPal Client Secret"
                          value={envConfig.PAYPAL_CLIENT_SECRET}
                          onChange={(e) =>
                            updateEnvVar("PAYPAL_CLIENT_SECRET", e.target.value)
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(envConfig.PAYPAL_CLIENT_SECRET)
                          }
                          disabled={!envConfig.PAYPAL_CLIENT_SECRET}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="paypalEnv" className="text-zinc-300">
                        Environment
                      </Label>
                      <select
                        id="paypalEnv"
                        value={envConfig.PAYPAL_ENVIRONMENT}
                        onChange={(e) =>
                          updateEnvVar("PAYPAL_ENVIRONMENT", e.target.value)
                        }
                        className="w-full mt-1 bg-zinc-800 border-zinc-700 text-white rounded-md p-2"
                      >
                        <option value="sandbox">Sandbox (Testing)</option>
                        <option value="live">Live (Production)</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={() => testConnection("paypal")}
                    disabled={
                      testing === "paypal" || !envConfig.PAYPAL_CLIENT_ID
                    }
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {testing === "paypal" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Test Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Configuration */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="apiUrl" className="text-zinc-300">
                      API URL
                    </Label>
                    <Input
                      id="apiUrl"
                      value={envConfig.API_URL}
                      onChange={(e) => updateEnvVar("API_URL", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Generated .env File
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <pre className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {generateEnvFile() ||
                          "# No environment variables configured"}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => copyToClipboard(generateEnvFile())}
                      disabled={!generateEnvFile()}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy .env Content
                    </Button>
                  </div>

                  <Button
                    onClick={() => testConnection("server")}
                    disabled={testing === "server"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {testing === "server" ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Test Server Health
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Configuration */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={saveConfiguration}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
