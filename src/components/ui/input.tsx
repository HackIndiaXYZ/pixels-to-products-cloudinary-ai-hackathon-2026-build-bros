import * as React from "react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full px-3 py-2",
        "bg-[--color-surface] border border-[--color-rule]",
        "text-sm text-[--color-ink] placeholder:text-[--color-ink-4]",
        "font-ui",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "transition-colors duration-100",
        "hover:border-[--color-rule-strong]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full px-4 py-3",
        "bg-[--color-surface] border border-[--color-rule]",
        "text-sm text-[--color-ink] placeholder:text-[--color-ink-4]",
        "resize-none",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-[--color-ink] focus-visible:outline-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "transition-colors duration-100",
        "hover:border-[--color-rule-strong]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
