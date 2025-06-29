import * as React from "react";
import { cn } from "@/lib/utils";

// Focus trap hook for modals and dialogs
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// Announce messages to screen readers
export function useAnnounce() {
  const [announcement, setAnnouncement] = React.useState("");

  const announce = React.useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      setAnnouncement(message);

      // Clear after announcement to allow re-announcing the same message
      setTimeout(() => setAnnouncement(""), 100);
    },
    [],
  );

  const AnnouncementRegion = React.useMemo(
    () =>
      ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div
          className={cn("sr-only", className)}
          aria-live="polite"
          aria-atomic="true"
          {...props}
        >
          {announcement}
        </div>
      ),
    [announcement],
  );

  return { announce, AnnouncementRegion };
}

// Enhanced keyboard navigation hook
export function useKeyboardNavigation(
  items: Array<{ id: string; element?: HTMLElement }>,
  isActive: boolean = true,
) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Home":
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentIndex(items.length - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [items.length, isActive]);

  // Focus the current item
  React.useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem?.element) {
      currentItem.element.focus();
    }
  }, [currentIndex, items]);

  return { currentIndex, setCurrentIndex, containerRef };
}

// Skip link component for keyboard navigation
export function SkipLink({
  href,
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:no-underline focus:transition-all focus:duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// Live region for dynamic content announcements
interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: "polite" | "assertive";
  atomic?: boolean;
}

export function LiveRegion({
  level = "polite",
  atomic = true,
  className,
  children,
  ...props
}: LiveRegionProps) {
  return (
    <div
      className={cn("sr-only", className)}
      aria-live={level}
      aria-atomic={atomic}
      {...props}
    >
      {children}
    </div>
  );
}

// Visually hidden component that's still accessible to screen readers
export function VisuallyHidden({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("sr-only", className)} {...props}>
      {children}
    </span>
  );
}

// Focus visible outline component
export function FocusRing({
  children,
  className,
  offset = "2px",
  color = "blue-500",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  offset?: string;
  color?: string;
}) {
  return (
    <div
      className={cn(
        `focus-within:ring-2 focus-within:ring-${color} focus-within:ring-offset-${offset} focus-within:ring-offset-black transition-all duration-200`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Enhanced button with comprehensive accessibility
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function AccessibleButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Loading...",
  icon,
  children,
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-3 text-base min-h-[44px]",
    lg: "px-6 py-4 text-lg min-h-[52px]",
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-white",
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation",
        sizeClasses[size],
        variantClasses[variant],
        loading && "cursor-wait",
        className,
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
          <VisuallyHidden>Please wait</VisuallyHidden>
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

// Keyboard navigation instructions component
export function KeyboardInstructions({
  instructions,
  className,
}: {
  instructions: string[];
  className?: string;
}) {
  return (
    <div className={cn("text-sm text-zinc-500", className)}>
      <VisuallyHidden>Keyboard navigation instructions:</VisuallyHidden>
      <ul className="space-y-1" role="list">
        {instructions.map((instruction, index) => (
          <li key={index} className="flex items-center gap-2">
            <kbd className="px-2 py-1 text-xs bg-zinc-800 rounded border border-zinc-700">
              {instruction.split(":")[0]}
            </kbd>
            <span>{instruction.split(":")[1]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Error boundary with accessibility considerations
interface AccessibleErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class AccessibleErrorBoundary extends React.Component<
  AccessibleErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: AccessibleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "Accessible Error Boundary caught an error:",
      error,
      errorInfo,
    );
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent && this.state.error) {
        return (
          <FallbackComponent error={this.state.error} retry={this.retry} />
        );
      }

      return (
        <div
          role="alert"
          className="p-6 bg-red-900/20 border border-red-800 rounded-lg"
          aria-live="assertive"
        >
          <h2 className="text-lg font-semibold text-red-300 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-400 mb-4">
            An error occurred while loading this content. Please try again.
          </p>
          <AccessibleButton
            variant="secondary"
            onClick={this.retry}
            className="bg-red-800 hover:bg-red-700"
          >
            Try Again
          </AccessibleButton>
        </div>
      );
    }

    return this.props.children;
  }
}
