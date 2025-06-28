import { useState, useEffect } from "react";
import { useAuth } from "@/providers/ClerkProvider";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";

interface UsageStats {
  totalTransformations: number;
  successfulTransformations: number;
  totalExecutionTime: number;
  successRate: number;
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageStats();
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

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "pro":
        return "bg-yellow-600";
      case "enterprise":
        return "bg-purple-600";
      default:
        return "bg-zinc-700";
    }
  };

  const getNextPlan = (currentPlan: string) => {
    if (currentPlan === "free") return "pro";
    if (currentPlan === "pro") return "enterprise";
    return null;
  };

  const getUsagePercentage = () => {
    if (!user) return 0;
    return (user.monthlyTransformationsUsed / user.monthlyLimit) * 100;
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
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
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-zinc-400 mt-1">Welcome back, {user.name}</p>
            </div>
            <Link to="/app">
              <Button className="bg-zinc-700 hover:bg-zinc-600">
                <Code className="w-4 h-4 mr-2" />
                Analyze Code
              </Button>
            </Link>
          </div>
        </div>

        {/* Plan Status Card */}
        <div className={`${getPlanColor(user.planType)} p-6 rounded-xl mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">
                  {user.planType.toUpperCase()} Plan
                </h2>
              </div>
              <p className="text-white/90">
                {user.monthlyTransformationsUsed} / {user.monthlyLimit}{" "}
                transformations used this month
              </p>
              <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                />
              </div>
            </div>
            {getNextPlan(user.planType) && (
              <Link to="/pricing">
                <Button
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Upgrade to {getNextPlan(user.planType)?.toUpperCase()}
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <BarChart className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {loading ? "..." : usage?.totalTransformations || 0}
              </p>
              <p className="text-sm text-zinc-400">Total Transformations</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {loading ? "..." : usage?.successRate.toFixed(1) || "0"}%
              </p>
              <p className="text-sm text-zinc-400">Success Rate</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {loading
                  ? "..."
                  : formatExecutionTime(usage?.totalExecutionTime || 0)}
              </p>
              <p className="text-sm text-zinc-400">Total Processing Time</p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">
                {user.monthlyLimit - user.monthlyTransformationsUsed}
              </p>
              <p className="text-sm text-zinc-400">Remaining This Month</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
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
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Plan Type</span>
                <span className="text-white font-medium">
                  {user.planType.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Monthly Limit</span>
                <span className="text-white font-medium">
                  {user.monthlyLimit} transformations
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
                  {user.monthlyTransformationsUsed} (
                  {getUsagePercentage().toFixed(1)}%)
                </span>
              </div>

              {getUsagePercentage() >= 90 && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm">
                    You're approaching your monthly limit. Consider upgrading.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
