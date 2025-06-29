import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type GlowVariant =
  | "always"
  | "hover"
  | "pulse"
  | "random-1"
  | "random-2"
  | "random-3"
  | "random-4"
  | "random-5"
  | "random-6";

export type GlowColor = "white" | "blue" | "green" | "purple";

interface GlowingBorderProps {
  children: ReactNode;
  variant?: GlowVariant;
  color?: GlowColor;
  className?: string;
  disabled?: boolean;
}

export const GlowingBorder = forwardRef<HTMLDivElement, GlowingBorderProps>(
  (
    {
      children,
      variant = "hover",
      color = "white",
      className,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const getGlowClass = () => {
      if (disabled) return "";

      const colorClass = color !== "white" ? `glow-border-${color}` : "";
      const variantClass = `glow-border-${variant}`;

      return cn("glow-border", variantClass, colorClass);
    };

    return (
      <div ref={ref} className={cn(getGlowClass(), className)} {...props}>
        {children}
      </div>
    );
  },
);

GlowingBorder.displayName = "GlowingBorder";

// Utility hook for random variant selection
export const useRandomGlowVariant = (): GlowVariant => {
  const variants: GlowVariant[] = [
    "random-1",
    "random-2",
    "random-3",
    "random-4",
    "random-5",
    "random-6",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
};

// Utility function to get a random glow variant
export const getRandomGlowVariant = (): GlowVariant => {
  const variants: GlowVariant[] = [
    "random-1",
    "random-2",
    "random-3",
    "random-4",
    "random-5",
    "random-6",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
};
