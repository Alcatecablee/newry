import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Webhook,
  Zap,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe,
  Code,
  Database,
  ArrowRight,
  Copy,
  Eye,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Edit,
  Plus,
  Send,
  Activity,
  BarChart3,
  GitBranch,
  MessageSquare,
  Bell,
  Shield,
} from "lucide-react";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "error" | "paused";
  secret: string;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: "linear" | "exponential";
    timeout: number;
  };
  headers: { [key: string]: string };
  lastDelivery: string;
  successRate: number;
  totalDeliveries: number;
  createdAt: string;
}

interface WebhookEvent {
  id: string;
  type: string;
  description: string;
  payload: any;
  timestamp: string;
  endpointId: string;
  deliveryStatus: "success" | "failed" | "retry" | "pending";
  attempts: number;
  responseCode?: number;
  responseTime?: number;
  errorMessage?: string;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  logo: string;
  category:
    | "ci-cd"
    | "communication"
    | "monitoring"
    | "ticketing"
    | "documentation";
  events: string[];
  configFields: ConfigField[];
  popular: boolean;
}

interface ConfigField {
  name: string;
  type: "text" | "url" | "secret" | "select";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const WebhookSystem = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const [webhookEndpoints, setWebhookEndpoints] = useState<WebhookEndpoint[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhookEndpoints();
  }, []);

  const fetchWebhookEndpoints = async () => {
    try {
      const response = await fetch("/api/enterprise/webhooks");
      if (response.ok) {
        const data = await response.json();
        setWebhookEndpoints(data);
      }
    } catch (error) {
      console.error("Failed to fetch webhook endpoints:", error);
    } finally {
      setLoading(false);
    }
  };

  const [recentEvents, setRecentEvents] = useState<WebhookEvent[]>([]);

  const fetchRecentEvents = async () => {
    try {
      const response = await fetch("/api/enterprise/webhook-events");
      if (response.ok) {
        const data = await response.json();
        setRecentEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch webhook events:", error);
    }
  };

  useEffect(() => {
    fetchRecentEvents();
  }, []);

  const integrationTemplates: IntegrationTemplate[] = [
    {
      id: "slack",
      name: "Slack",
      description: "Send notifications to Slack channels",
      logo: "/logos/slack.svg",
      category: "communication",
      events: ["fix.completed", "scan.failed", "team.achievement"],
      popular: true,
      configFields: [
        {
          name: "webhook_url",
          type: "url",
          label: "Webhook URL",
          required: true,
          placeholder: "https://hooks.slack.com/services/...",
        },
        {
          name: "channel",
          type: "text",
          label: "Channel",
          required: false,
          placeholder: "#dev-alerts",
        },
      ],
    },
    {
      id: "jira",
      name: "Jira",
      description: "Create tickets for vulnerabilities and issues",
      logo: "/logos/jira.svg",
      category: "ticketing",
      events: ["vulnerability.detected", "critical.issue"],
      popular: true,
      configFields: [
        {
          name: "base_url",
          type: "url",
          label: "Jira Base URL",
          required: true,
          placeholder: "https://company.atlassian.net",
        },
        {
          name: "project_key",
          type: "text",
          label: "Project Key",
          required: true,
          placeholder: "DEV",
        },
        {
          name: "api_token",
          type: "secret",
          label: "API Token",
          required: true,
        },
      ],
    },
    {
      id: "github-actions",
      name: "GitHub Actions",
      description: "Trigger workflows based on NeuroLint events",
      logo: "/logos/github.svg",
      category: "ci-cd",
      events: ["scan.completed", "fix.completed"],
      popular: false,
      configFields: [
        {
          name: "repo",
          type: "text",
          label: "Repository",
          required: true,
          placeholder: "owner/repo",
        },
        {
          name: "event_type",
          type: "text",
          label: "Event Type",
          required: true,
          placeholder: "neurolint-scan",
        },
        {
          name: "token",
          type: "secret",
          label: "GitHub Token",
          required: true,
        },
      ],
    },
    {
      id: "discord",
      name: "Discord",
      description: "Send messages to Discord channels",
      logo: "/logos/discord.svg",
      category: "communication",
      events: ["fix.completed", "team.achievement"],
      popular: false,
      configFields: [
        {
          name: "webhook_url",
          type: "url",
          label: "Webhook URL",
          required: true,
        },
        {
          name: "username",
          type: "text",
          label: "Bot Username",
          required: false,
          placeholder: "NeuroLint",
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-200";
      case "paused":
        return "bg-yellow-900 text-yellow-200";
      case "error":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "failed":
        return "text-red-400";
      case "retry":
        return "text-yellow-400";
      case "pending":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const handleTestWebhook = async (endpointId: string) => {
    setTestingWebhook(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingWebhook(false);
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Enterprise Webhooks
            </h1>
            <p className="text-zinc-400">
              Real-time integrations and event notifications
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </div>

        {/* Webhook Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Active Webhooks</p>
                  <p className="text-3xl font-bold text-white">
                    {
                      webhookEndpoints.filter((w) => w.status === "active")
                        .length
                    }
                  </p>
                </div>
                <Webhook className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">2 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Deliveries</p>
                  <p className="text-3xl font-bold text-white">2.8K</p>
                </div>
                <Send className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">+15% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-green-400">96.8%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">Above target</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Avg Response</p>
                  <p className="text-3xl font-bold text-white">324ms</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                +12ms from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="endpoints"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Webhook className="w-4 h-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Activity className="w-4 h-4 mr-2" />
              Event Log
            </TabsTrigger>
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Endpoint List */}
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhookEndpoints.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedEndpoint === endpoint.id
                            ? "border-blue-400 bg-blue-900/20"
                            : "border-zinc-800 bg-zinc-900 hover:bg-zinc-900"
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">
                              {endpoint.name}
                            </p>
                            <p className="text-zinc-400 text-sm truncate">
                              {endpoint.url}
                            </p>
                          </div>
                          <Badge className={getStatusColor(endpoint.status)}>
                            {endpoint.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">
                            {endpoint.events.length} events
                          </span>
                          <span className="text-green-400">
                            {endpoint.successRate}% success
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {endpoint.events.slice(0, 2).map((event) => (
                            <Badge
                              key={event}
                              className="bg-zinc-900 text-zinc-400 text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                          {endpoint.events.length > 2 && (
                            <Badge className="bg-zinc-900 text-zinc-400 text-xs">
                              +{endpoint.events.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Endpoint Configuration */}
              {selectedEndpoint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Configuration</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestWebhook(selectedEndpoint)}
                          disabled={testingWebhook}
                        >
                          {testingWebhook ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button size="sm" variant="primary">
                          Save Changes
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const endpoint = webhookEndpoints.find(
                        (e) => e.id === selectedEndpoint,
                      );
                      if (!endpoint) return null;

                      return (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={endpoint.name}
                              className="bg-zinc-900 border-zinc-800 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="url">Webhook URL</Label>
                            <Input
                              id="url"
                              value={endpoint.url}
                              className="bg-zinc-900 border-zinc-800 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="secret">Secret</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="secret"
                                value={endpoint.secret}
                                type={showSecrets ? "text" : "password"}
                                className="bg-zinc-900 border-zinc-800 text-white"
                              />
                              <Button size="sm" variant="ghost">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label>Events</Label>
                            <div className="space-y-2 mt-2">
                              {[
                                "fix.completed",
                                "scan.failed",
                                "vulnerability.detected",
                                "team.achievement",
                              ].map((event) => (
                                <div
                                  key={event}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-white text-sm">
                                    {event}
                                  </span>
                                  <Switch
                                    checked={endpoint.events.includes(event)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-zinc-800 pt-4">
                            <h4 className="text-white font-medium mb-3">
                              Retry Policy
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Max Retries</Label>
                                <Input
                                  value={endpoint.retryPolicy.maxRetries}
                                  type="number"
                                  className="bg-zinc-900 border-zinc-800 text-white"
                                />
                              </div>
                              <div>
                                <Label>Timeout (seconds)</Label>
                                <Input
                                  value={endpoint.retryPolicy.timeout}
                                  type="number"
                                  className="bg-zinc-900 border-zinc-800 text-white"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-zinc-800 pt-4">
                            <h4 className="text-white font-medium mb-3">
                              Custom Headers
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(endpoint.headers).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="grid grid-cols-2 gap-2"
                                  >
                                    <Input
                                      value={key}
                                      placeholder="Header name"
                                      className="bg-zinc-900 border-zinc-800 text-white"
                                    />
                                    <Input
                                      value={value}
                                      placeholder="Header value"
                                      className="bg-zinc-900 border-zinc-800 text-white"
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Webhook Events</span>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-zinc-900 rounded-lg border border-zinc-800er"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-zinc-900 text-white">
                              {event.type}
                            </Badge>
                            <Badge
                              className={
                                event.deliveryStatus === "success"
                                  ? "bg-green-900 text-green-200"
                                  : event.deliveryStatus === "failed"
                                    ? "bg-red-900 text-red-200"
                                    : event.deliveryStatus === "retry"
                                      ? "bg-yellow-900 text-yellow-200"
                                      : "bg-blue-900 text-blue-200"
                              }
                            >
                              {event.deliveryStatus}
                            </Badge>
                          </div>
                          <p className="text-white font-medium mt-1">
                            {event.description}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {event.timestamp}
                          </p>
                        </div>
                        <div className="text-right">
                          {event.responseCode && (
                            <p
                              className={`text-sm font-medium ${
                                event.responseCode >= 200 &&
                                event.responseCode < 300
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {event.responseCode}
                            </p>
                          )}
                          {event.responseTime && (
                            <p className="text-zinc-400 text-xs">
                              {event.responseTime}ms
                            </p>
                          )}
                          <p className="text-zinc-400 text-xs">
                            Attempt {event.attempts}
                          </p>
                        </div>
                      </div>

                      {event.errorMessage && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-200 text-sm">
                          {event.errorMessage}
                        </div>
                      )}

                      <details className="mt-2">
                        <summary className="text-zinc-400 text-sm cursor-pointer">
                          View Payload
                        </summary>
                        <pre className="mt-2 p-2 bg-zinc-900 rounded text-xs text-zinc-400 overflow-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrationTemplates.map((template) => (
                <Card key={template.id} className="relative">
                  {template.popular && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-900 text-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                        <span className="text-black font-bold">
                          {template.name[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <Badge className="bg-zinc-900 text-zinc-400 text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-400 text-sm mb-4">
                      {template.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <p className="text-white text-sm font-medium">
                        Supported Events:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.events.map((event) => (
                          <Badge
                            key={event}
                            className="bg-zinc-900 text-zinc-400 text-xs"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Success rate chart would be here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Event volume chart would be here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {webhookEndpoints.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className="flex items-center justify-between p-2 bg-zinc-900 rounded"
                      >
                        <span className="text-white text-sm">
                          {endpoint.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-900 h-2 rounded-full">
                            <div
                              className="bg-blue-400 h-2 rounded-full"
                              style={{
                                width: `${Math.min(endpoint.successRate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-zinc-400 text-xs">
                            {Math.round(Math.random() * 500 + 200)}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { error: "Timeout", count: 12, percentage: 45 },
                      {
                        error: "500 Internal Server Error",
                        count: 8,
                        percentage: 30,
                      },
                      { error: "404 Not Found", count: 4, percentage: 15 },
                      { error: "401 Unauthorized", count: 3, percentage: 10 },
                    ].map((error) => (
                      <div
                        key={error.error}
                        className="flex items-center justify-between p-2 bg-zinc-900 rounded"
                      >
                        <span className="text-white text-sm">
                          {error.error}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-xs">
                            {error.count}
                          </span>
                          <div className="w-16 bg-zinc-900 h-2 rounded-full">
                            <div
                              className="bg-red-400 h-2 rounded-full"
                              style={{ width: `${error.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WebhookSystem;
