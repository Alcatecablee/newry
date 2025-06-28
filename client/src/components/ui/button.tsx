import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:scale-105 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:rotate-6 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50 active:bg-zinc-900",
        primary:
          "bg-white text-black hover:bg-gray-100 border border-gray-300 hover:shadow-lg hover:shadow-white/20 active:bg-gray-50",
        destructive:
          "bg-red-900 text-white hover:bg-red-800 border border-red-700 hover:shadow-lg hover:shadow-red-900/50 active:bg-red-900",
        outline:
          "border border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-white hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/30",
        secondary:
          "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:shadow-lg hover:shadow-zinc-800/50 active:bg-zinc-800",
        ghost:
          "hover:bg-zinc-900 hover:text-white hover:shadow-lg hover:shadow-zinc-900/30",
        link: "text-zinc-400 underline-offset-4 hover:underline hover:text-white hover:scale-100 active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[2.5rem]",
        sm: "h-9 rounded-md px-3 min-w-[2.25rem]",
        lg: "h-12 rounded-md px-8 min-w-[3rem] text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
