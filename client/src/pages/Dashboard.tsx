import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "react-router-dom";
import {
  BarChart,
  TrendingUp,
  Clock,
  Code,
  Crown,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";

interface UsageStats {
  totalTransformations: number;
  successfulTransformations: number;
  totalExecutionTime: number;
  successRate: number;
}

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  darkMode: boolean;
  autoSave: boolean;
}

export default function Dashboard() {
  const { user, updateUser, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    darkMode: theme === "dark",
    autoSave: true,
  });

  useEffect(() => {
    if (user) {
      fetchUsageStats();
      setProfileForm({
        fullName: user.user_metadata.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/auth/usage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const usageData = await response.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      // TODO: Implement profile update API call
      console.log("Saving profile:", profileForm);
      setEditingProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      // TODO: Implement password update API call
      console.log("Updating password");
      setEditingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  const handleSettingsChange = (key: keyof UserSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "darkMode") {
      setTheme(value ? "dark" : "light");
    }
  };

  const getPlanColor = (planType: string) => {
    // Use only zinc colors for all plans
    return "bg-zinc-700";
  };

  const getNextPlan = (currentPlan: string) => {
    if (currentPlan === "free") return "pro";
    if (currentPlan === "pro") return "enterprise";
    return null;
  };

  const getUsagePercentage = () => {
    if (!user) return 0;
    const used = user.app_metadata.monthly_transformations_used || 0;
    const limit = user.app_metadata.monthly_limit || 25;
    return (used / limit) * 100;
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) {
      // For milliseconds, round to 1 decimal place or whole number for cleaner display
      return ms % 1 === 0
        ? `${Math.round(ms)}ms`
        : `${Math.round(ms * 10) / 10}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-4">
            Please sign in to view your dashboard
          </p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-zinc-400 mt-1">
              Welcome back, {user.user_metadata.full_name || user.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app">
              <Button className="bg-zinc-700 hover:bg-zinc-600">
                <Code className="w-4 h-4 mr-2" />
                Analyze Code
              </Button>
            </Link>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>
                {(user.user_metadata.full_name || user.email)
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border-zinc-800 mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Plan Status Card */}
            <Card
              className={`${getPlanColor(user.app_metadata.plan_type || "free")} border-0`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-white" />
                      <h2 className="text-xl font-bold text-white">
                        {(user.app_metadata.plan_type || "free").toUpperCase()}{" "}
                        Plan
                      </h2>
                    </div>
                    <p className="text-white/90 mb-3">
                      {user.app_metadata.monthly_transformations_used || 0} /{" "}
                      {user.app_metadata.monthly_limit || 25} transformations
                      used this month
                    </p>
                    <Progress
                      value={getUsagePercentage()}
                      className="h-2 bg-white/20"
                    />
                  </div>
                  {getNextPlan(user.app_metadata.plan_type || "free") && (
                    <Link to="/pricing">
                      <Button
                        variant="secondary"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Upgrade to{" "}
                        {getNextPlan(
                          user.app_metadata.plan_type || "free",
                        )?.toUpperCase()}
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <BarChart className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {loading ? "..." : usage?.totalTransformations || 0}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Total Transformations
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {loading ? "..." : usage?.successRate.toFixed(1) || "0"}%
                    </p>
                    <p className="text-sm text-zinc-400">Success Rate</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <Clock className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {loading
                        ? "..."
                        : formatExecutionTime(usage?.totalExecutionTime || 0)}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Total Processing Time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-white">
                      {(user.app_metadata.monthly_limit || 25) -
                        (user.app_metadata.monthly_transformations_used || 0)}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Remaining This Month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/app" className="block">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Code className="w-5 h-5 text-violet-400" />
                        <span className="text-white">Analyze New Code</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </Link>

                  <Link to="/pricing" className="block">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Manage Pricing</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </Link>

                  <Link to="/team" className="block">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Team Collaboration</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Plan Type</span>
                    <Badge variant="outline" className="border-zinc-600">
                      {(user.app_metadata.plan_type || "free").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Monthly Limit</span>
                    <span className="text-white font-medium">
                      {user.app_metadata.monthly_limit || 25} transformations
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Used This Month</span>
                    <span
                      className={`font-medium ${
                        getUsagePercentage() >= 90
                          ? "text-red-400"
                          : getUsagePercentage() >= 70
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      {user.app_metadata.monthly_transformations_used || 0} (
                      {getUsagePercentage().toFixed(1)}%)
                    </span>
                  </div>

                  {getUsagePercentage() >= 90 && (
                    <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-300 text-sm">
                        You're approaching your monthly limit. Consider
                        upgrading.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Profile Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      {editingProfile ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback className="text-lg">
                        {(user.user_metadata.full_name || user.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.user_metadata.full_name || "User"}
                      </h3>
                      <p className="text-zinc-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-zinc-300">
                        Full Name
                      </Label>
                      {editingProfile ? (
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white mt-1">
                          {user.user_metadata.full_name || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-zinc-300">
                        Email
                      </Label>
                      {editingProfile ? (
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      ) : (
                        <p className="text-white mt-1">{user.email}</p>
                      )}
                    </div>

                    {editingProfile && (
                      <div className="flex gap-2">
                        <Button onClick={handleProfileSave} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Security</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPassword(!editingPassword)}
                    >
                      {editingPassword ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingPassword ? (
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="currentPassword"
                          className="text-zinc-300"
                        >
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            className="bg-zinc-800 border-zinc-700 text-white pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="text-zinc-300">
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="confirmPassword"
                          className="text-zinc-300"
                        >
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handlePasswordSave} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPassword(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Password</span>
                        <span className="text-zinc-400">••••••••</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">
                          Two-Factor Authentication
                        </span>
                        <Badge variant="outline" className="border-zinc-600">
                          Disabled
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="email-notifications"
                        className="text-white"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-zinc-400">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="push-notifications"
                        className="text-white"
                      >
                        Push Notifications
                      </Label>
                      <p className="text-sm text-zinc-400">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("pushNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weekly-reports" className="text-white">
                        Weekly Reports
                      </Label>
                      <p className="text-sm text-zinc-400">
                        Get weekly summaries of your usage
                      </p>
                    </div>
                    <Switch
                      id="weekly-reports"
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("weeklyReports", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Preferences
                  </CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode" className="text-white">
                        Dark Mode
                      </Label>
                      <p className="text-sm text-zinc-400">
                        Use dark theme across the application
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-zinc-400" />
                      <Switch
                        id="dark-mode"
                        checked={settings.darkMode}
                        onCheckedChange={(checked) =>
                          handleSettingsChange("darkMode", checked)
                        }
                      />
                      <Moon className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-white">
                        Auto Save
                      </Label>
                      <p className="text-sm text-zinc-400">
                        Automatically save your work
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) =>
                        handleSettingsChange("autoSave", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Delete Account</Label>
                    <p className="text-sm text-zinc-400">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Sign Out</Label>
                    <p className="text-sm text-zinc-400">
                      Sign out of your account on this device
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-zinc-800/50 rounded-lg">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {(user.app_metadata.plan_type || "free").toUpperCase()}
                    </h3>
                    <p className="text-zinc-400 mb-4">
                      {user.app_metadata.monthly_limit || 25} transformations
                      per month
                    </p>
                    <Progress
                      value={getUsagePercentage()}
                      className="h-2 mb-2"
                    />
                    <p className="text-sm text-zinc-400">
                      {user.app_metadata.monthly_transformations_used || 0} /{" "}
                      {user.app_metadata.monthly_limit || 25} used
                    </p>
                  </div>

                  <Link to="/pricing">
                    <Button className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Free Plan</p>
                        <p className="text-sm text-zinc-400">Current plan</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-green-600 text-green-400"
                      >
                        Active
                      </Badge>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-zinc-400">
                        No billing history available
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        Upgrade to a paid plan to see billing history
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
