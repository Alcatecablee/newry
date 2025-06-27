import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserButton } from "@/components/auth/UserButton";

export const SiteHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isAppPage = location.pathname === "/app";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isAppPage && (
              <Link to="/" className="flex items-center group">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                  alt="NeuroLint Logo"
                  className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/features"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              Pricing
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              App
            </Link>
            <span
              className="px-4 py-2 text-sm font-medium text-zinc-500 cursor-not-allowed rounded-lg relative group"
              title="Coming Soon"
            >
              Teams
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                Soon
              </span>
            </span>
            <Link
              to="/test"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              Test Suite
            </Link>
            {isAuthenticated && (
              <Link
                to="/billing"
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                Billing
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800/50 animate-pulse" />
            ) : isAuthenticated ? (
              <UserButton />
            ) : (
              <SignInButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 h-9 w-9 p-0"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-zinc-800/50">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/features"
                className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/app"
                className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                App
              </Link>
              <div className="block px-3 py-2 text-sm font-medium text-zinc-500 rounded-lg">
                Teams <span className="text-xs">(Coming Soon)</span>
              </div>
              <Link
                to="/test"
                className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Test Suite
              </Link>
              {isAuthenticated && (
                <Link
                  to="/billing"
                  className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Billing
                </Link>
              )}
              <div className="px-3 py-2">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-zinc-800/50 animate-pulse" />
                ) : isAuthenticated ? (
                  <UserButton />
                ) : (
                  <SignInButton />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
