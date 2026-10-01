import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-ui text-sm font-medium transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-ink]",
    "disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[--color-ink] text-[--color-background] hover:bg-[--color-ink-2]",
        secondary:
          "bg-[--color-surface] text-[--color-ink] border border-[--color-rule] hover:border-[--color-rule-strong] hover:bg-[--color-surface-2]",
        ghost:
          "text-[--color-ink-2] hover:text-[--color-ink] hover:bg-[--color-surface-2]",
        danger:
          "bg-[--color-critical] text-white hover:opacity-90",
        link:
          "text-[--color-ink] underline underline-offset-4 hover:text-[--color-ink-2] p-0 h-auto",
      },
      size: {
        sm:   "h-8 px-3 text-xs",
        md:   "h-9 px-4",
        lg:   "h-10 px-5",
        xl:   "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
