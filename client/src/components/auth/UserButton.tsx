import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/ClerkProvider";
import {
  User,
  Settings,
  Crown,
  BarChart,
  LogOut,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";

export function UserButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const { user, signOut, updateUser } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMenu && user) {
      fetchUsage();
    }
  }, [showMenu, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsage = async () => {
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
    }
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case "pro":
        return "bg-yellow-600";
      case "enterprise":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  if (!user) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-gray-300">
        <User className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white font-semibold hover:bg-violet-700 transition-colors ring-2 ring-transparent hover:ring-violet-400"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-80 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 bg-zinc-800/50 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-lg font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${getPlanBadgeColor(user.planType)}`}
                  >
                    {user.planType.toUpperCase()}
                  </span>
                  {user.planType !== "free" && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="p-4 border-b border-zinc-800">
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Usage This Month
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-300">Transformations</span>
                <span
                  className={`text-sm font-medium ${getUsageColor(user.monthlyTransformationsUsed, user.monthlyLimit)}`}
                >
                  {user.monthlyTransformationsUsed} / {user.monthlyLimit}
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    user.monthlyTransformationsUsed / user.monthlyLimit >= 0.9
                      ? "bg-red-500"
                      : user.monthlyTransformationsUsed / user.monthlyLimit >=
                          0.7
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((user.monthlyTransformationsUsed / user.monthlyLimit) * 100, 100)}%`,
                  }}
                />
              </div>
              {usage && (
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                    <div className="text-white font-medium">
                      {usage.totalTransformations}
                    </div>
                    <div className="text-zinc-500">Total</div>
                  </div>
                  <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                    <div className="text-white font-medium">
                      {usage.successRate.toFixed(1)}%
                    </div>
                    <div className="text-zinc-500">Success</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              to="/dashboard"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <BarChart className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/billing"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Billing & Plans
            </Link>

            <Link
              to="/settings"
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            <div className="border-t border-zinc-800 my-2"></div>

            <button
              onClick={() => {
                signOut();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
