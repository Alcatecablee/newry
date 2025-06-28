import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  actionButton?: {
    label: string;
    href: string;
    className?: string;
  };
  backToHome?: boolean;
}

export const PageHeader = ({
  title,
  description,
  icon,
  badge,
  actionButton,
  backToHome = true,
}: PageHeaderProps) => {
  return (
    <div className="relative z-10 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-8">
          {backToHome && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 rounded-xl text-sm font-medium backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          )}

          {actionButton && (
            <Link
              to={actionButton.href}
              className={`inline-flex items-center px-4 py-2 font-medium rounded-xl transition-all duration-200 text-sm shadow-lg ${actionButton.className || "bg-white text-black hover:bg-gray-100"}`}
            >
              {actionButton.label}
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
                {icon && <div className="w-4 h-4 text-zinc-400">{icon}</div>}
                <span className="text-sm font-medium text-zinc-400">
                  {badge}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">
              {title}
            </h1>

            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
