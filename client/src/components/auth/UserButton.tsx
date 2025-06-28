import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Zap,
  Crown,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function UserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const { user, signOut } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;

      // For Supabase, we get usage data from user metadata
      setUsage({
        monthlyTransformationsUsed:
          user.app_metadata?.monthly_transformations_used || 0,
        monthlyLimit: user.app_metadata?.monthly_limit || 25,
      });
    };

    fetchUsage();
  }, [user]);

  if (!user) return null;

  const planType = user.app_metadata?.plan_type || "free";
  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const usagePercentage = usage
    ? Math.round((usage.monthlyTransformationsUsed / usage.monthlyLimit) * 100)
    : 0;

  const getPlanIcon = () => {
    switch (planType) {
      case "pro":
        return <Zap className="w-4 h-4 text-zinc-400" />;
      case "enterprise":
        return <Crown className="w-4 h-4 text-zinc-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlanColor = () => {
    switch (planType) {
      case "pro":
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
      case "enterprise":
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900/80 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 backdrop-blur-xl"
      >
        <div className="w-8 h-8 bg-zinc-700 rounded-lg flex items-center justify-center">
          <User className="w-4 h-4 text-zinc-300" />
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white truncate max-w-32">
            {displayName}
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            {getPlanIcon()}
            {planType.charAt(0).toUpperCase() + planType.slice(1)}
          </div>
        </div>

        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900/95 border border-zinc-800/50 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-zinc-700 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {displayName}
                </div>
                <div className="text-xs text-zinc-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className={`text-xs ${getPlanColor()}`}>
                {getPlanIcon()}
                <span className="ml-1">
                  {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                </span>
              </Badge>
            </div>

            {usage && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Transformations</span>
                  <span className="text-zinc-300">
                    {usage.monthlyTransformationsUsed} / {usage.monthlyLimit}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300 bg-white"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200"
            >
              <CreditCard className="w-4 h-4" />
              Billing & Plans
            </Link>

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-xl transition-all duration-200"
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
