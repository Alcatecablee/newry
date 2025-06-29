import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    const inputId = React.useId();
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 py-3 text-base transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black focus:border-blue-500 hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white will-change-transform md:text-sm touch-manipulation",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className,
          )}
          ref={ref}
          aria-describedby={helperTextId}
          aria-invalid={error}
          {...props}
        />
        {helperText && (
          <p
            id={helperTextId}
            className={cn(
              "mt-1 text-xs transition-colors duration-200",
              error ? "text-red-400" : "text-zinc-500",
            )}
            role={error ? "alert" : "status"}
            aria-live={error ? "polite" : "off"}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
