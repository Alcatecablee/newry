import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:scale-105 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-all [&_svg]:duration-300 hover:[&_svg]:rotate-6 hover:[&_svg]:scale-110 focus:[&_svg]:rotate-6 focus:[&_svg]:scale-110 relative overflow-hidden will-change-transform touch-manipulation",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50 active:bg-zinc-900 focus:bg-zinc-800 focus:border-zinc-700 focus:shadow-lg focus:shadow-zinc-900/50",
        primary:
          "bg-white text-black hover:bg-gray-100 border border-gray-300 hover:shadow-lg hover:shadow-white/20 active:bg-gray-50 focus:bg-gray-100 focus:shadow-lg focus:shadow-white/20",
        destructive:
          "bg-red-900 text-white hover:bg-red-800 border border-red-700 hover:shadow-lg hover:shadow-red-900/50 active:bg-red-900 focus:bg-red-800 focus:shadow-lg focus:shadow-red-900/50",
        outline:
          "border border-zinc-800 bg-transparent hover:bg-zinc-900 hover:text-white hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/30 focus:bg-zinc-900 focus:text-white focus:border-zinc-700 focus:shadow-lg focus:shadow-zinc-900/30",
        secondary:
          "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:shadow-lg hover:shadow-zinc-800/50 active:bg-zinc-800 focus:bg-zinc-700 focus:shadow-lg focus:shadow-zinc-800/50",
        ghost:
          "hover:bg-zinc-900 hover:text-white hover:shadow-lg hover:shadow-zinc-900/30 focus:bg-zinc-900 focus:text-white focus:shadow-lg focus:shadow-zinc-900/30",
        link: "text-zinc-400 underline-offset-4 hover:underline hover:text-white hover:scale-100 active:scale-100 focus:underline focus:text-white focus:scale-100",
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
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const content = (
      <>
        {loading ? (
          <>
            <div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
              role="status"
            />
            <span>{loadingText || "Loading..."}</span>
            <span className="sr-only">Processing request, please wait</span>
          </>
        ) : (
          children
        )}

        {/* Enhanced shine effect on hover and focus */}
        {!loading && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] group-focus:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Ripple effect container */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        />
      </>
    );

    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size }),
            loading && "cursor-wait",
            className,
          )}
          ref={ref}
          {...props}
        >
          <span
            className="relative flex items-center justify-center gap-2 w-full h-full"
            aria-disabled={disabled || loading}
          >
            {content}
          </span>
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          loading && "cursor-wait",
          "group",
          className,
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        data-loading={loading}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
