import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Enhanced transition variants with better easing
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1], // Custom easing curve for smooth feel
  duration: 0.4,
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced loading skeleton with better animations
export function EnhancedSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-zinc-800/50 animate-pulse rounded-md ${className}`}
      style={{
        background: `linear-gradient(
          90deg,
          rgba(113, 113, 122, 0.2) 25%,
          rgba(113, 113, 122, 0.4) 50%,
          rgba(113, 113, 122, 0.2) 75%
        )`,
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite ease-in-out",
      }}
      {...props}
    />
  );
}

// Staggered animation container for list items
interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggeredContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual item for staggered animations
export function StaggeredItem({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// Enhanced loading spinner with smooth animations
export function LoadingSpinner({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ willChange: "transform" }}
      role="status"
      aria-label="Loading"
    />
  );
}

// Fade in when element comes into view
export function FadeInWhenVisible({
  children,
  className,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, threshold }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// Enhanced hover scale effect
export function HoverScale({
  children,
  scale = 1.05,
  className,
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
