import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  variant?: "default" | "elevated" | "outlined";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) will-change-transform",
        {
          "border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-sm hover:bg-zinc-900/90 hover:border-zinc-700":
            variant === "default",
          "border-zinc-800 bg-zinc-900 shadow-lg hover:shadow-xl hover:border-zinc-700":
            variant === "elevated",
          "border-zinc-700 bg-transparent hover:bg-zinc-900/50 hover:border-zinc-600":
            variant === "outlined",
        },
        interactive &&
          "cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl focus:scale-[1.02] focus:-translate-y-1 focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black",
        "text-white",
        className,
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-white",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-zinc-400", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
