import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Settings,
  Bell,
  Code,
  Save,
  Plus,
  Trash2,
  Edit,
  Copy,
  Lock,
  Zap,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Auditor";
  permissions: string[];
  lastActive: string;
}

interface CustomRule {
  id: string;
  name: string;
  description: string;
  layers: number[];
  conditions: string[];
  active: boolean;
  createdBy: string;
  createdAt: string;
}

const TeamSettings = () => {
  const [teamName, setTeamName] = useState("Acme Engineering");
  const [notifications, setNotifications] = useState({
    slackWebhook: "https://hooks.slack.com/services/...",
    emailAlerts: true,
    failureAlerts: true,
    successSummary: true,
    weeklyReport: true,
  });

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@company.com",
      role: "Owner",
      permissions: ["all"],
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      email: "mike@company.com",
      role: "Admin",
      permissions: ["run-fixes", "view-reports", "manage-rules"],
      lastActive: "4 hours ago",
    },
    {
      id: "3",
      name: "Alex Kim",
      email: "alex@company.com",
      role: "Developer",
      permissions: ["run-fixes", "view-reports"],
      lastActive: "1 hour ago",
    },
  ]);

  const [customRules, setCustomRules] = useState<CustomRule[]>([
    {
      id: "1",
      name: "React Hooks Only",
      description: "Enforce React hooks pattern, discourage class components",
      layers: [3],
      conditions: ["*.tsx", "*.jsx"],
      active: true,
      createdBy: "Sarah Chen",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Strict TypeScript",
      description: "Enforce strict TypeScript settings across all files",
      layers: [1, 2],
      conditions: ["*.ts", "*.tsx"],
      active: true,
      createdBy: "Mike Rodriguez",
      createdAt: "2024-01-10",
    },
  ]);

  const rolePermissions = {
    Owner: ["all"],
    Admin: ["run-fixes", "view-reports", "manage-rules", "manage-members"],
    Developer: ["run-fixes", "view-reports"],
    Auditor: ["view-reports"],
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-900 text-purple-200";
      case "Admin":
        return "bg-blue-900 text-blue-200";
      case "Developer":
        return "bg-green-900 text-green-200";
      case "Auditor":
        return "bg-gray-700 text-gray-200";
      default:
        return "bg-charcoal-light text-white";
    }
  };

  const handleSaveSettings = () => {
    // Save team settings
    console.log("Saving team settings...");
  };

  const handleInviteMember = () => {
    // Open invite member modal
    console.log("Invite new member...");
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
  };

  const handleToggleRule = (ruleId: string) => {
    setCustomRules((rules) =>
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-charcoal-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Team Settings
            </h1>
            <p className="text-charcoal-lighter">
              Manage your team's NeuroLint configuration and permissions
            </p>
          </div>
          <Button onClick={handleSaveSettings} variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-charcoal-light border-charcoal-lighter">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Users className="w-4 h-4 mr-2" />
              Members & Roles
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Code className="w-4 h-4 mr-2" />
              Custom Rules
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-charcoal border-charcoal-light text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Plan</Label>
                    <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg mt-1">
                      <span className="text-white">Pro Team</span>
                      <Badge className="bg-green-900 text-green-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Usage This Month</Label>
                    <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg mt-1">
                      <span className="text-white">72 / 100 fixes</span>
                      <span className="text-charcoal-lighter">72%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Default Layers</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4].map((layer) => (
                      <Badge
                        key={layer}
                        className="bg-charcoal-light text-white"
                      >
                        Layer {layer}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Team Members</h2>
              <Button onClick={handleInviteMember} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-4 ${index !== members.length - 1 ? "border-b border-charcoal-light" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal-light flex items-center justify-center text-white font-medium">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {member.name}
                            </p>
                            <p className="text-charcoal-lighter text-sm">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>

                        <div className="text-right">
                          <p className="text-charcoal-lighter text-sm">
                            Last active
                          </p>
                          <p className="text-white text-sm">
                            {member.lastActive}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {member.role !== "Owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Permissions Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(rolePermissions).map(
                    ([role, permissions]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg"
                      >
                        <Badge className={getRoleColor(role)}>{role}</Badge>
                        <div className="flex items-center gap-2">
                          {permissions.includes("all") ? (
                            <Badge className="bg-green-900 text-green-200">
                              All Permissions
                            </Badge>
                          ) : (
                            permissions.map((perm) => (
                              <Badge
                                key={perm}
                                className="bg-charcoal text-charcoal-lighter"
                              >
                                {perm.replace("-", " ")}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Custom Rules</h2>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <div className="space-y-4">
              {customRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium">
                            {rule.name}
                          </h3>
                          <Switch
                            checked={rule.active}
                            onCheckedChange={() => handleToggleRule(rule.id)}
                          />
                        </div>
                        <p className="text-charcoal-lighter text-sm mt-1">
                          {rule.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <span className="text-charcoal-lighter text-xs">
                              Layers:
                            </span>
                            {rule.layers.map((layer) => (
                              <Badge
                                key={layer}
                                className="bg-charcoal text-white text-xs"
                              >
                                {layer}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-charcoal-lighter text-xs">
                              Files:
                            </span>
                            {rule.conditions.map((condition) => (
                              <Badge
                                key={condition}
                                className="bg-charcoal text-white text-xs"
                              >
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className="text-charcoal-light text-xs mt-2">
                          Created by {rule.createdBy} on {rule.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slack Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slackWebhook">Webhook URL</Label>
                  <Input
                    id="slackWebhook"
                    value={notifications.slackWebhook}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        slackWebhook: e.target.value,
                      })
                    }
                    className="bg-charcoal border-charcoal-light text-white"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Alerts</Label>
                    <p className="text-charcoal-lighter text-sm">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailAlerts: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Transformation Failures</Label>
                    <p className="text-charcoal-lighter text-sm">
                      Get notified when fixes fail
                    </p>
                  </div>
                  <Switch
                    checked={notifications.failureAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        failureAlerts: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Success Summary</Label>
                    <p className="text-charcoal-lighter text-sm">
                      Daily summary of successful fixes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.successSummary}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        successSummary: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-charcoal-lighter text-sm">
                      Weekly team performance reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        weeklyReport: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">
                      Enterprise Feature
                    </span>
                  </div>
                  <p className="text-charcoal-lighter text-sm">
                    SSO/SAML integration, audit logs, and VPC deployment are
                    available in our Enterprise tier.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Upgrade to Enterprise
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg">
                    <span className="text-white">
                      Two-Factor Authentication
                    </span>
                    <Badge className="bg-green-900 text-green-200">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg">
                    <span className="text-white">Session Timeout</span>
                    <span className="text-charcoal-lighter">24 hours</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-charcoal-light rounded-lg">
                    <span className="text-white">IP Allowlist</span>
                    <Badge className="bg-gray-700 text-gray-200">
                      Not Configured
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamSettings;
