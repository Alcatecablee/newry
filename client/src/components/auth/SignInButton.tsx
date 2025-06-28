import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function SignInButton() {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (mode === "signin") {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.success) {
        setShowModal(false);
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  if (showModal) {
    return (
      <div
        className="fixed inset-0 bg-black/60 z-50 p-4"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          minWidth: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl mx-auto"
          style={{
            maxHeight: "90vh",
            overflow: "auto",
            margin: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">
              {mode === "signin" ? "Sign In to NeuroLint" : "Create Account"}
            </h2>
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {mode === "signin" ? (
                    <LogIn className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm">
              {mode === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                className="text-zinc-400 hover:text-zinc-300 font-medium transition-colors"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      className="font-semibold"
      onClick={() => setShowModal(true)}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
