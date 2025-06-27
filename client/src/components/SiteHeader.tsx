import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserButton } from "@/components/auth/UserButton";

export const SiteHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="relative z-50 w-full border-b border-charcoal-light bg-charcoal/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">NeuroLint</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/app"
              className="!text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
            >
              App
            </Link>
            <span
              className="!text-white !opacity-50 cursor-not-allowed font-medium"
              title="Coming Soon"
            >
              Teams
            </span>
            <Link
              to="/test"
              className="!text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
            >
              Test Suite
            </Link>
            {isAuthenticated && (
              <Link
                to="/billing"
                className="!text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
              >
                Billing
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-charcoal animate-pulse" />
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
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-charcoal-light bg-charcoal/90 backdrop-blur-lg">
              <Link
                to="/app"
                className="block px-3 py-2 !text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                App
              </Link>
              <div className="block px-3 py-2 !text-white !opacity-50 font-medium">
                Teams
              </div>
              <Link
                to="/test"
                className="block px-3 py-2 !text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Test Suite
              </Link>
              {isAuthenticated && (
                <Link
                  to="/billing"
                  className="block px-3 py-2 !text-white !opacity-90 hover:!text-white hover:!opacity-100 transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Billing
                </Link>
              )}
              <div className="px-3 py-2">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-charcoal animate-pulse" />
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
