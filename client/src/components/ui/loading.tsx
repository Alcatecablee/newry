import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced loading spinner with multiple variants
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "bounce";
  color?: "white" | "blue" | "zinc";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  color = "white",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    white: "text-white",
    blue: "text-blue-500",
    zinc: "text-zinc-400",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full",
              size === "sm" && "w-1 h-1",
              size === "md" && "w-2 h-2",
              size === "lg" && "w-3 h-3",
              size === "xl" && "w-4 h-4",
              colorClasses[color].replace("text-", "bg-"),
            )}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn(
          "rounded-full border-2",
          sizeClasses[size],
          colorClasses[color].replace("text-", "border-"),
          className,
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (variant === "bounce") {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full",
              size === "sm" && "w-2 h-2",
              size === "md" && "w-3 h-3",
              size === "lg" && "w-4 h-4",
              size === "xl" && "w-6 h-6",
              colorClasses[color].replace("text-", "bg-"),
            )}
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <motion.div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className,
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  variant = "spinner",
  className,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner variant={variant} size="lg" />
        {message && (
          <p className="text-white text-lg font-medium" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-zinc-800/50";
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "loading-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      role="status"
      aria-label="Loading content"
    />
  );
}

// Loading button state
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
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
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
          <span className="sr-only">Processing request</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Progressive loading component for images
interface ProgressiveImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  className,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              aria-hidden="true"
            />
          ) : (
            <Skeleton className="w-full h-full" />
          )}
        </div>
      )}

      <motion.img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
}

// Lazy loading wrapper with intersection observer
interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

export function LazyLoad({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = "50px",
  className,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible
        ? children
        : placeholder || <Skeleton className="w-full h-24" />}
    </div>
  );
}
