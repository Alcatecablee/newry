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
  const [showPassword, setShowPassword] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { signIn, signUp } = useAuth();

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Modal management with animations
  const openModal = () => {
    setShowModal(true);
    setTimeout(() => setIsModalVisible(true), 10);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setShowModal(false);
      document.body.style.overflow = "unset";
      triggerRef.current?.focus();
    }, 200);
    resetForm();
  };

  // Focus management
  useEffect(() => {
    if (showModal && isModalVisible) {
      firstInputRef.current?.focus();
    }
  }, [showModal, isModalVisible, mode]);

  // Escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

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
        closeModal();
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
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  if (showModal) {
    return (
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center transition-all duration-300 ease-out ${
          isModalVisible ? "opacity-100" : "opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          ref={modalRef}
          className={`bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl mx-auto transform transition-all duration-300 ease-out ${
            isModalVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4"
          }`}
          style={{
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 id="modal-title" className="text-xl font-semibold text-white">
              {mode === "signin" ? "Sign In to NeuroLint" : "Create Account"}
            </h2>
            <button
              onClick={closeModal}
              className="text-zinc-400 hover:text-white transition-all duration-200 ease-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded p-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <p id="modal-description" className="sr-only">
              {mode === "signin"
                ? "Sign in to your NeuroLint account using your email and password"
                : "Create a new NeuroLint account by providing your name, email, and password"}
            </p>

            {error && (
              <div
                className="p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-300 animate-in slide-in-from-top-2 duration-300"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {mode === "signup" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Full Name *
                </label>
                <input
                  id="fullName"
                  ref={mode === "signup" ? firstInputRef : undefined}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-300 ease-out hover:border-zinc-600"
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  aria-describedby={
                    mode === "signup" ? "fullName-help" : undefined
                  }
                />
                <p id="fullName-help" className="sr-only">
                  Enter your full name for account registration
                </p>
              </div>
            )}

            <div
              className="animate-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: mode === "signup" ? "50ms" : "0ms" }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email Address *
              </label>
              <input
                id="email"
                ref={mode === "signin" ? firstInputRef : undefined}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-300 ease-out hover:border-zinc-600"
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
                aria-describedby="email-help"
              />
              <p id="email-help" className="sr-only">
                Enter a valid email address
              </p>
            </div>

            <div
              className="animate-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: mode === "signup" ? "100ms" : "50ms" }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all duration-300 ease-out hover:border-zinc-600"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  aria-describedby="password-help"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-800 rounded p-1 transition-all duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p id="password-help" className="text-xs text-zinc-500 mt-1">
                {mode === "signup"
                  ? "Password must be at least 6 characters long"
                  : "Enter your account password"}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white py-3 font-medium animate-in slide-in-from-top-2 duration-300"
              style={{ animationDelay: mode === "signup" ? "150ms" : "100ms" }}
              loading={loading}
              loadingText="Processing..."
              disabled={loading}
            >
              {!loading && (
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
