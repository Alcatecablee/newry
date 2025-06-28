import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserButton } from "@/components/auth/UserButton";

export const SiteHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isAppPage = location.pathname === "/app";
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mobile menu close on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-zinc-800/50 backdrop-blur-xl transition-all duration-300 ease-out ${
        isScrolled ? "bg-black/98 shadow-2xl shadow-black/50" : "bg-black/95"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isAppPage && (
              <Link
                to="/"
                className="flex items-center group"
                aria-label="NeuroLint home"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                  alt="NeuroLint Logo"
                  className="h-8 w-auto transition-all duration-300 ease-out group-hover:scale-110 group-focus:scale-110 group-focus:outline-none group-focus:ring-2 group-focus:ring-zinc-500 group-focus:ring-offset-2 group-focus:ring-offset-black rounded"
                />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {[
              { to: "/features", label: "Features" },
              { to: "/pricing", label: "Pricing" },
              { to: "/app", label: "App" },
              { to: "/api-docs", label: "API" },
              { to: "/teams", label: "Teams" },
              { to: "/test", label: "Test Suite" },
              { to: "/admin", label: "Admin" },
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black relative ${
                  location.pathname === item.to
                    ? "text-white bg-zinc-800/50"
                    : ""
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: isScrolled
                    ? "slideInDown 0.3s ease-out forwards"
                    : "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {loading ? (
              <div
                className="w-8 h-8 rounded-full bg-zinc-800/50 animate-pulse"
                role="status"
                aria-label="Loading user authentication status"
              />
            ) : isAuthenticated ? (
              <UserButton />
            ) : (
              <SignInButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 h-10 w-10 p-0 transition-all duration-200 ease-out hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
                    isMenuOpen
                      ? "opacity-0 rotate-90 scale-75"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
                    isMenuOpen
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 rotate-90 scale-75"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div
          className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ease-out ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isMenuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`absolute top-16 left-0 right-0 bg-black/98 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl shadow-black/50 transform transition-all duration-300 ease-out ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
            role="menu"
            aria-labelledby="mobile-menu-button"
          >
            <nav className="px-4 py-6 space-y-1" role="navigation">
              {[
                { to: "/features", label: "Features" },
                { to: "/pricing", label: "Pricing" },
                { to: "/app", label: "App" },
                { to: "/teams", label: "Teams" },
                { to: "/test", label: "Test Suite" },
                { to: "/admin", label: "Admin" },
              ].map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block px-4 py-3 text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-300 ease-out transform hover:translate-x-2 focus:translate-x-2 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-black min-h-[48px] flex items-center ${
                    location.pathname === item.to
                      ? "text-white bg-zinc-800/50"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMenuOpen
                      ? `slideInLeft 0.3s ease-out ${index * 50}ms forwards`
                      : "none",
                  }}
                >
                  {item.label}
                </Link>
              ))}

              {/* Auth Section in Mobile Menu */}
              <div className="border-t border-zinc-800/50 mt-4 pt-4 px-4">
                {loading ? (
                  <div
                    className="w-8 h-8 rounded-full bg-zinc-800/50 animate-pulse"
                    role="status"
                    aria-label="Loading user authentication status"
                  />
                ) : isAuthenticated ? (
                  <UserButton />
                ) : (
                  <div className="w-full">
                    <SignInButton />
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
