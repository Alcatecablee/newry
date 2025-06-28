import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import {
  Shield,
  Key,
  Settings,
  CheckCircle,
  AlertTriangle,
  Users,
  Globe,
  Lock,
  Zap,
  Building,
  Cloud,
  Database,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Crown,
  Star,
  Verified,
} from "lucide-react";

interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oidc" | "oauth2";
  logo: string;
  status: "active" | "inactive" | "testing" | "error";
  userCount: number;
  lastSync: string;
  configuration: SSOConfig;
}

interface SSOConfig {
  entityId?: string;
  ssoUrl?: string;
  certificateFingerprint?: string;
  clientId?: string;
  clientSecret?: string;
  issuer?: string;
  scope?: string[];
  mappings: {
    email: string;
    firstName: string;
    lastName: string;
    groups: string;
    role: string;
  };
}

interface ComplianceReport {
  id: string;
  type: "soc2" | "gdpr" | "hipaa" | "iso27001";
  status: "compliant" | "partial" | "non-compliant";
  lastAudit: string;
  nextAudit: string;
  score: number;
  findings: ComplianceFinding[];
}

interface ComplianceFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  remediation: string;
  status: "open" | "in-progress" | "resolved";
}

const SSOIntegration = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSsoProviders();
  }, []);

  const fetchSsoProviders = async () => {
    try {
      const response = await fetch('/api/enterprise/sso-providers');
      if (response.ok) {
        const data = await response.json();
        setSsoProviders(data);
      }
    } catch (error) {
      console.error('Failed to fetch SSO providers:', error);
    } finally {
      setLoading(false);
    }
  };
    {
      id: "1",
      name: "Okta",
      type: "saml",
      logo: "/logos/okta.svg",
      status: "active",
      userCount: 147,
      lastSync: "2 minutes ago",
      configuration: {
        entityId: "urn:amazon:cognito:sp:us-east-1_example",
        ssoUrl: "https://dev-12345.okta.com/app/amazon_aws/exampleId/sso/saml",
        certificateFingerprint: "AA:BB:CC:DD:EE:FF...",
        mappings: {
          email: "user.email",
          firstName: "user.firstName",
          lastName: "user.lastName",
          groups: "user.groups",
          role: "user.role",
        },
      },
    },
    {
      id: "2",
      name: "Azure AD",
      type: "oidc",
      logo: "/logos/azure.svg",
      status: "active",
      userCount: 89,
      lastSync: "5 minutes ago",
      configuration: {
        clientId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        clientSecret: "***********",
        issuer: "https://login.microsoftonline.com/tenant-id/v2.0",
        scope: ["openid", "profile", "email"],
        mappings: {
          email: "email",
          firstName: "given_name",
          lastName: "family_name",
          groups: "groups",
          role: "roles",
        },
      },
    },
    {
      id: "3",
      name: "Google Workspace",
      type: "oauth2",
      logo: "/logos/google.svg",
      status: "testing",
      userCount: 0,
      lastSync: "Never",
      configuration: {
        clientId: "123456789-abc123.apps.googleusercontent.com",
        clientSecret: "***********",
        scope: ["openid", "email", "profile"],
        mappings: {
          email: "email",
          firstName: "given_name",
          lastName: "family_name",
          groups: "hd",
          role: "role",
        },
      },
    },
  ];

  const complianceReports: ComplianceReport[] = [
    {
      id: "1",
      type: "soc2",
      status: "compliant",
      lastAudit: "2024-01-15",
      nextAudit: "2024-07-15",
      score: 94,
      findings: [
        {
          id: "1",
          severity: "medium",
          title: "Password Policy Enhancement",
          description: "Implement additional password complexity requirements",
          remediation: "Update password policy to require special characters",
          status: "in-progress",
        },
      ],
    },
    {
      id: "2",
      type: "gdpr",
      status: "compliant",
      lastAudit: "2024-01-10",
      nextAudit: "2025-01-10",
      score: 98,
      findings: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-200";
      case "testing":
        return "bg-yellow-900 text-yellow-200";
      case "error":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-400";
      case "partial":
        return "text-yellow-400";
      case "non-compliant":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingConnection(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingConnection(false);
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
        title="Enterprise SSO & Security"
        description="Single Sign-On integration and compliance management for enterprise-grade security."
        icon={<Shield className="w-4 h-4" />}
        badge="Enterprise Feature"
        actionButton={{
          label: "Try NeuroLint",
          href: "/app",
        }}
      />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Action buttons */}
          <div className="flex justify-end gap-4 mb-8">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>

          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Connected Users</p>
                    <p className="text-3xl font-bold text-white">
                      {ssoProviders.reduce((acc, p) => acc + p.userCount, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-xs text-green-400 mt-2">+12% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Active Providers</p>
                    <p className="text-3xl font-bold text-white">
                      {ssoProviders.filter((p) => p.status === "active").length}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-2">2 SAML, 1 OIDC</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Security Score</p>
                    <p className="text-3xl font-bold text-green-400">96%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-green-400 mt-2">SOC2 Compliant</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm">Last Audit</p>
                    <p className="text-3xl font-bold text-white">15</p>
                  </div>
                  <Verified className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xs text-zinc-400 mt-2">days ago</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="providers" className="space-y-6">
            <TabsList className="bg-zinc-900 border-zinc-800er">
              <TabsTrigger
                value="providers"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Key className="w-4 h-4 mr-2" />
                SSO Providers
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Shield className="w-4 h-4 mr-2" />
                Compliance
              </TabsTrigger>
              <TabsTrigger
                value="audit-logs"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Database className="w-4 h-4 mr-2" />
                Audit Logs
              </TabsTrigger>
              <TabsTrigger
                value="provisioning"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                <Users className="w-4 h-4 mr-2" />
                User Provisioning
              </TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Identity Providers</span>
                      <Button size="sm" variant="primary">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Add Provider
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ssoProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedProvider === provider.id
                              ? "border-blue-400 bg-blue-900/20"
                              : "border-zinc-800 bg-zinc-900 hover:bg-zinc-900"
                          }`}
                          onClick={() => setSelectedProvider(provider.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                                <span className="text-black font-bold text-xs">
                                  {provider.name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {provider.name}
                                </p>
                                <p className="text-zinc-400 text-xs uppercase">
                                  {provider.type}
                                </p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(provider.status)}>
                              {provider.status}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">
                              {provider.userCount} users
                            </span>
                            <span className="text-zinc-400">
                              Last sync: {provider.lastSync}
                            </span>
                          </div>

                          {provider.status === "active" && (
                            <div className="flex items-center gap-1 mt-2">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 text-xs">
                                Connected and syncing
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Configuration */}
                {selectedProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Configuration</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleTestConnection(selectedProvider)
                            }
                            disabled={testingConnection}
                          >
                            {testingConnection ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 mr-1" />
                            )}
                            Test Connection
                          </Button>
                          <Button size="sm" variant="primary">
                            Save Changes
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const provider = ssoProviders.find(
                          (p) => p.id === selectedProvider,
                        );
                        if (!provider) return null;

                        return (
                          <div className="space-y-4">
                            {provider.type === "saml" && (
                              <>
                                <div>
                                  <Label htmlFor="entityId">Entity ID</Label>
                                  <Input
                                    id="entityId"
                                    value={provider.configuration.entityId}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="ssoUrl">SSO URL</Label>
                                  <Input
                                    id="ssoUrl"
                                    value={provider.configuration.ssoUrl}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="certificate">
                                    Certificate Fingerprint
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="certificate"
                                      value={
                                        provider.configuration
                                          .certificateFingerprint
                                      }
                                      type={showSecrets ? "text" : "password"}
                                      className="bg-zinc-900 border-zinc-800 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setShowSecrets(!showSecrets)
                                      }
                                    >
                                      {showSecrets ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}

                            {provider.type === "oidc" && (
                              <>
                                <div>
                                  <Label htmlFor="clientId">Client ID</Label>
                                  <Input
                                    id="clientId"
                                    value={provider.configuration.clientId}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="clientSecret">
                                    Client Secret
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      id="clientSecret"
                                      value={
                                        provider.configuration.clientSecret
                                      }
                                      type={showSecrets ? "text" : "password"}
                                      className="bg-zinc-900 border-zinc-800 text-white"
                                    />
                                    <Button size="sm" variant="ghost">
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="issuer">Issuer URL</Label>
                                  <Input
                                    id="issuer"
                                    value={provider.configuration.issuer}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                  />
                                </div>
                              </>
                            )}

                            <div className="border-t border-zinc-800 pt-4">
                              <h4 className="text-white font-medium mb-3">
                                Attribute Mappings
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(
                                  provider.configuration.mappings,
                                ).map(([key, value]) => (
                                  <div key={key}>
                                    <Label htmlFor={key} className="capitalize">
                                      {key}
                                    </Label>
                                    <Input
                                      id={key}
                                      value={value}
                                      className="bg-zinc-900 border-zinc-800 text-white"
                                    />
                                  </div>
                                ))}
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

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 bg-zinc-900 rounded-lg border border-zinc-800er"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium uppercase">
                                {report.type}
                              </span>
                              <Badge
                                className={
                                  report.status === "compliant"
                                    ? "bg-green-900 text-green-200"
                                    : report.status === "partial"
                                      ? "bg-yellow-900 text-yellow-200"
                                      : "bg-red-900 text-red-200"
                                }
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <div
                              className={`text-2xl font-bold ${getComplianceColor(report.status)}`}
                            >
                              {report.score}%
                            </div>
                          </div>
                          <div className="text-sm text-zinc-400">
                            <p>Last audit: {report.lastAudit}</p>
                            <p>Next audit: {report.nextAudit}</p>
                            <p>{report.findings.length} findings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          control: "Multi-Factor Authentication",
                          status: "enabled",
                          coverage: 100,
                        },
                        {
                          control: "Session Management",
                          status: "enabled",
                          coverage: 98,
                        },
                        {
                          control: "Access Logging",
                          status: "enabled",
                          coverage: 100,
                        },
                        {
                          control: "Data Encryption",
                          status: "enabled",
                          coverage: 100,
                        },
                        {
                          control: "Regular Backups",
                          status: "enabled",
                          coverage: 95,
                        },
                        {
                          control: "Vulnerability Scanning",
                          status: "enabled",
                          coverage: 92,
                        },
                      ].map((control) => (
                        <div
                          key={control.control}
                          className="flex items-center justify-between p-3 bg-zinc-900 rounded"
                        >
                          <span className="text-white">{control.control}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 text-sm">
                              {control.coverage}%
                            </span>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audit-logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Security Audit Logs</span>
                    <Button size="sm" variant="outline">
                      <Download className="w-3 h-3 mr-1" />
                      Export Logs
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        time: "2024-01-20 14:32:15",
                        event: "User Login",
                        user: "sarah.chen@company.com",
                        result: "Success",
                        ip: "192.168.1.100",
                      },
                      {
                        time: "2024-01-20 14:28:42",
                        event: "SSO Configuration Changed",
                        user: "admin@company.com",
                        result: "Success",
                        ip: "192.168.1.50",
                      },
                      {
                        time: "2024-01-20 14:15:33",
                        event: "Failed Login Attempt",
                        user: "unknown@malicious.com",
                        result: "Blocked",
                        ip: "10.0.0.1",
                      },
                      {
                        time: "2024-01-20 13:45:22",
                        event: "User Provisioned",
                        user: "new.user@company.com",
                        result: "Success",
                        ip: "192.168.1.75",
                      },
                      {
                        time: "2024-01-20 12:22:11",
                        event: "Permission Updated",
                        user: "alex.kim@company.com",
                        result: "Success",
                        ip: "192.168.1.120",
                      },
                    ].map((log, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded text-sm"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-zinc-400">{log.time}</span>
                          <span className="text-white">{log.event}</span>
                          <span className="text-zinc-400">{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">{log.ip}</span>
                          <Badge
                            className={
                              log.result === "Success"
                                ? "bg-green-900 text-green-200"
                                : log.result === "Blocked"
                                  ? "bg-red-900 text-red-200"
                                  : "bg-yellow-900 text-yellow-200"
                            }
                          >
                            {log.result}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="provisioning" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Provisioning Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          rule: "Developers → Developer Role",
                          condition: "group=developers",
                          enabled: true,
                        },
                        {
                          rule: "Admins → Admin Role",
                          condition: "group=admins",
                          enabled: true,
                        },
                        {
                          rule: "Managers → Team Lead Role",
                          condition: "department=management",
                          enabled: true,
                        },
                        {
                          rule: "Contractors → Limited Access",
                          condition: "employeeType=contractor",
                          enabled: false,
                        },
                      ].map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-zinc-900 rounded"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {rule.rule}
                            </p>
                            <p className="text-zinc-400 text-sm">
                              {rule.condition}
                            </p>
                          </div>
                          <Switch checked={rule.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Provisioning Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          action: "User Created",
                          user: "john.doe@company.com",
                          role: "Developer",
                          time: "2 hours ago",
                        },
                        {
                          action: "Role Updated",
                          user: "jane.smith@company.com",
                          role: "Team Lead",
                          time: "4 hours ago",
                        },
                        {
                          action: "User Deactivated",
                          user: "old.employee@company.com",
                          role: "Developer",
                          time: "1 day ago",
                        },
                        {
                          action: "Group Assigned",
                          user: "new.intern@company.com",
                          role: "Observer",
                          time: "2 days ago",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 text-sm"
                        >
                          <div>
                            <p className="text-white">{activity.action}</p>
                            <p className="text-zinc-400">{activity.user}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white">{activity.role}</p>
                            <p className="text-zinc-400">{activity.time}</p>
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
    </div>
  );
};

export default SSOIntegration;